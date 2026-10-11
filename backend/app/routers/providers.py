from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    User, UserRole, ProviderProfile, Booking, BookingStatus, ProviderBid, BidStatus,
    ProviderVehicle, ProviderDocument, VerificationStatus, Payment, PaymentStatus
)
from app.schemas.schemas import (
    ProviderBidCreate, ProviderLocationUpdate, ProviderVehicleCreate, BookingStatusUpdate
)
from app.routers.deps import get_current_provider, get_current_user
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/providers", tags=["Providers"])

@router.get("/dashboard")
def get_provider_dashboard(
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    # Active jobs
    active_jobs_count = db.query(Booking).filter(
        Booking.provider_id == provider.id,
        Booking.status.in_([
            BookingStatus.PROVIDER_ASSIGNED,
            BookingStatus.EN_ROUTE,
            BookingStatus.ARRIVED,
            BookingStatus.SERVICE_IN_PROGRESS
        ])
    ).count()

    # Completed jobs
    completed_jobs_count = db.query(Booking).filter(
        Booking.provider_id == provider.id,
        Booking.status == BookingStatus.COMPLETED
    ).count()

    # Available nearby jobs waiting for bids or pickup
    available_jobs_count = db.query(Booking).filter(
        Booking.status.in_([BookingStatus.SEARCHING, BookingStatus.BIDDING])
    ).count()

    # Calculate earnings from completed jobs
    completed_bookings = db.query(Booking).filter(
        Booking.provider_id == provider.id,
        Booking.status == BookingStatus.COMPLETED
    ).all()
    gross_earnings = sum(b.final_price or b.estimated_price for b in completed_bookings)
    platform_fee = round(gross_earnings * 0.15, 2)
    net_earnings = round(gross_earnings - platform_fee, 2)

    return {
        "provider_id": provider.id,
        "business_name": provider.business_name,
        "is_verified": provider.is_verified,
        "verification_status": provider.verification_status.value,
        "is_available": provider.is_available,
        "rating": provider.rating,
        "total_jobs": completed_jobs_count,
        "active_jobs_count": active_jobs_count,
        "available_jobs_count": available_jobs_count,
        "earnings": {
            "gross": gross_earnings,
            "platform_fee": platform_fee,
            "net": net_earnings,
            "pending_payout": net_earnings
        }
    }

@router.get("/jobs")
def get_provider_jobs(
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    # 1. Assigned or active jobs for this provider
    assigned = db.query(Booking).filter(
        Booking.provider_id == provider.id
    ).order_by(Booking.updated_at.desc()).all()

    # 2. Available marketplace/bidding jobs if provider is verified
    available = []
    if provider.is_verified and provider.verification_status == VerificationStatus.APPROVED:
        available = db.query(Booking).filter(
            Booking.status.in_([BookingStatus.SEARCHING, BookingStatus.BIDDING])
        ).order_by(Booking.created_at.desc()).all()

    def format_job(b: Booking):
        has_bid = any(bid.provider_id == provider.id for bid in b.bids)
        return {
            "id": b.id,
            "booking_code": b.booking_code,
            "service_name": b.service.name if b.service else "Towing",
            "status": b.status.value,
            "dispatch_mode": b.dispatch_mode.value,
            "vehicle": f"{b.vehicle_brand} {b.vehicle_model} ({b.vehicle_type})",
            "vehicle_plate": b.vehicle_plate,
            "problem": b.problem_type,
            "pickup_address": b.pickup_address,
            "pickup_lat": b.pickup_lat,
            "pickup_lng": b.pickup_lng,
            "destination_address": b.destination_address,
            "estimated_distance_km": b.estimated_distance_km,
            "estimated_price": b.estimated_price,
            "final_price": b.final_price,
            "created_at": b.created_at,
            "has_provider_bid": has_bid
        }

    return {
        "assigned_jobs": [format_job(b) for b in assigned],
        "available_jobs": [format_job(b) for b in available]
    }

@router.post("/jobs/{job_id}/accept")
async def accept_job(
    job_id: int,
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    if not provider.is_verified:
        raise HTTPException(status_code=403, detail="Unverified providers cannot accept jobs.")

    booking = db.query(Booking).filter(Booking.id == job_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Job not found")

    if booking.status not in [BookingStatus.REQUESTED, BookingStatus.SEARCHING]:
        raise HTTPException(status_code=400, detail=f"Job cannot be accepted in current status: {booking.status.value}")

    booking.provider_id = provider.id
    booking.status = BookingStatus.PROVIDER_ASSIGNED
    db.commit()

    await ws_manager.broadcast_to_booking(booking.id, {
        "type": "STATUS_CHANGED",
        "status": "PROVIDER_ASSIGNED",
        "provider_id": provider.id,
        "business_name": provider.business_name
    })

    return {"success": True, "status": booking.status.value, "booking_id": booking.id}

@router.post("/jobs/{job_id}/bid")
async def submit_bid(
    job_id: int,
    bid_in: ProviderBidCreate,
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    if not provider.is_verified:
        raise HTTPException(status_code=403, detail="Only verified providers may submit bids.")

    booking = db.query(Booking).filter(Booking.id == job_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Job not found")

    if booking.status != BookingStatus.BIDDING:
        raise HTTPException(status_code=400, detail="This job is not accepting bids.")

    # Check if provider already bid
    existing = db.query(ProviderBid).filter(
        ProviderBid.booking_id == job_id,
        ProviderBid.provider_id == provider.id
    ).first()

    if existing:
        existing.bid_amount = bid_in.bid_amount
        existing.eta_minutes = bid_in.eta_minutes
        existing.notes = bid_in.notes
        db.commit()
        db.refresh(existing)
        bid = existing
    else:
        bid = ProviderBid(
            booking_id=job_id,
            provider_id=provider.id,
            bid_amount=bid_in.bid_amount,
            eta_minutes=bid_in.eta_minutes,
            notes=bid_in.notes,
            status=BidStatus.PENDING
        )
        db.add(bid)
        db.commit()
        db.refresh(bid)

    # Notify via WebSocket
    await ws_manager.broadcast_to_booking(booking.id, {
        "type": "NEW_BID",
        "bid_id": bid.id,
        "provider_id": provider.id,
        "provider_name": provider.business_name,
        "amount": bid.bid_amount,
        "eta": bid.eta_minutes
    })

    return {"success": True, "bid_id": bid.id, "amount": bid.bid_amount}

@router.patch("/jobs/{job_id}/status")
async def update_job_status(
    job_id: int,
    status_data: BookingStatusUpdate,
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == job_id, Booking.provider_id == provider.id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Assigned booking not found")

    valid_transitions = [
        BookingStatus.EN_ROUTE,
        BookingStatus.ARRIVED,
        BookingStatus.SERVICE_IN_PROGRESS,
        BookingStatus.COMPLETED
    ]

    if status_data.status not in valid_transitions:
        raise HTTPException(status_code=400, detail=f"Invalid status update: {status_data.status.value}")

    booking.status = status_data.status
    if status_data.status == BookingStatus.COMPLETED:
        booking.completed_at = datetime.utcnow()
        provider.total_jobs += 1

    db.commit()

    await ws_manager.broadcast_to_booking(booking.id, {
        "type": "STATUS_CHANGED",
        "status": booking.status.value,
        "timestamp": datetime.utcnow().isoformat()
    })

    return {"success": True, "status": booking.status.value}

@router.patch("/availability")
def toggle_availability(
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    provider.is_available = not provider.is_available
    db.commit()
    return {"success": True, "is_available": provider.is_available}

@router.post("/location")
async def update_provider_location(
    loc: ProviderLocationUpdate,
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    provider.latitude = loc.lat
    provider.longitude = loc.lng
    db.commit()

    if loc.booking_id:
        await ws_manager.broadcast_to_booking(loc.booking_id, {
            "type": "LOCATION_UPDATE",
            "lat": loc.lat,
            "lng": loc.lng,
            "speed": loc.speed,
            "heading": loc.heading
        })

    return {"success": True, "lat": loc.lat, "lng": loc.lng}

@router.get("/vehicles")
def get_vehicles(provider: ProviderProfile = Depends(get_current_provider)):
    return [
        {
            "id": v.id,
            "vehicle_type": v.vehicle_type,
            "make_model": v.make_model,
            "license_plate": v.license_plate,
            "year": v.year,
            "capacity_tons": v.capacity_tons,
            "is_active": v.is_active,
            "verified": v.verified
        }
        for v in provider.vehicles
    ]

@router.post("/vehicles")
def add_vehicle(
    veh_in: ProviderVehicleCreate,
    provider: ProviderProfile = Depends(get_current_provider),
    db: Session = Depends(get_db)
):
    vehicle = ProviderVehicle(
        provider_id=provider.id,
        vehicle_type=veh_in.vehicle_type,
        make_model=veh_in.make_model,
        license_plate=veh_in.license_plate.upper(),
        year=veh_in.year,
        capacity_tons=veh_in.capacity_tons,
        is_active=True,
        verified=True
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return {"success": True, "vehicle_id": vehicle.id}

@router.get("/documents")
def get_documents(provider: ProviderProfile = Depends(get_current_provider)):
    return [
        {
            "id": d.id,
            "document_type": d.document_type,
            "document_url": d.document_url,
            "status": d.status.value,
            "rejection_reason": d.rejection_reason,
            "uploaded_at": d.uploaded_at
        }
        for d in provider.documents
    ]

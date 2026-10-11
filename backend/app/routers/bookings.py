import random
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    User, UserRole, Booking, BookingStatus, DispatchMode, ServiceCategory,
    BookingPhoto, ProviderBid, BidStatus, ProviderProfile, Notification
)
from app.schemas.schemas import (
    BookingCreate, PriceEstimateRequest, PriceEstimateResponse, BookingStatusUpdate
)
from app.routers.deps import get_current_user
from app.services.pricing_service import pricing_service
from app.services.dispatch_service import dispatch_service
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("/estimate", response_model=PriceEstimateResponse)
def get_price_estimate(req: PriceEstimateRequest, db: Session = Depends(get_db)):
    service = db.query(ServiceCategory).filter(ServiceCategory.id == req.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Selected service category not found")

    est = pricing_service.calculate_estimate(
        base_fee=service.base_price,
        per_km_rate=service.per_km_rate,
        pickup_lat=req.pickup_lat,
        pickup_lng=req.pickup_lng,
        destination_lat=req.destination_lat,
        destination_lng=req.destination_lng,
        vehicle_type=req.vehicle_type
    )
    return est

@router.post("")
async def create_booking(
    req: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = db.query(ServiceCategory).filter(ServiceCategory.id == req.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service category not found")

    # Estimate price
    est = pricing_service.calculate_estimate(
        base_fee=service.base_price,
        per_km_rate=service.per_km_rate,
        pickup_lat=req.pickup_lat,
        pickup_lng=req.pickup_lng,
        destination_lat=req.destination_lat,
        destination_lng=req.destination_lng,
        vehicle_type=req.vehicle_type
    )

    booking_code = f"AR-{random.randint(10000, 99999)}"

    booking = Booking(
        booking_code=booking_code,
        customer_id=current_user.id,
        service_id=service.id,
        status=BookingStatus.REQUESTED,
        dispatch_mode=req.dispatch_mode,
        vehicle_type=req.vehicle_type,
        vehicle_brand=req.vehicle_brand,
        vehicle_model=req.vehicle_model,
        vehicle_plate=req.vehicle_plate.upper(),
        fuel_type=req.fuel_type or "Petrol",
        vehicle_condition=req.vehicle_condition or "Stationary / Immobile",
        problem_type=req.problem_type,
        problem_description=req.problem_description,
        pickup_address=req.pickup_address,
        pickup_lat=req.pickup_lat,
        pickup_lng=req.pickup_lng,
        destination_address=req.destination_address,
        destination_lat=req.destination_lat,
        destination_lng=req.destination_lng,
        estimated_distance_km=est["distance_km"],
        estimated_price=est["estimated_total"],
        final_price=est["estimated_total"],
        estimated_eta_minutes=est["estimated_eta_mins"]
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Attach breakdown photos if provided
    for url in (req.photo_urls or []):
        photo = BookingPhoto(
            booking_id=booking.id,
            photo_url=url,
            photo_type="BREAKDOWN",
            ai_predicted_label=req.ai_predicted_label,
            ai_confidence=req.ai_confidence
        )
        db.add(photo)
    db.commit()

    # Dispatch logic
    assigned_provider = None
    if req.dispatch_mode == DispatchMode.AUTO:
        assigned_provider = dispatch_service.auto_dispatch_job(db, booking)
        if not assigned_provider:
            # If no provider directly available, put in SEARCHING status
            booking.status = BookingStatus.SEARCHING
            db.commit()
    else:
        # Bidding Mode: Notify eligible providers and change status to BIDDING
        dispatch_service.start_bidding_dispatch(db, booking)

    # Send in-app notification to customer
    notif = Notification(
        user_id=current_user.id,
        title=f"Roadside Request Dispatched ({booking.booking_code})",
        message=f"Your request for {service.name} has been dispatched. Status: {booking.status.value}",
        notification_type="BOOKING_UPDATE"
    )
    db.add(notif)
    db.commit()

    return {
        "id": booking.id,
        "booking_code": booking.booking_code,
        "status": booking.status.value,
        "dispatch_mode": booking.dispatch_mode.value,
        "estimated_price": booking.estimated_price,
        "estimated_eta_minutes": booking.estimated_eta_minutes,
        "assigned_provider_id": booking.provider_id
    }

@router.get("")
def list_bookings(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if current_user.role == UserRole.CUSTOMER:
        query = query.filter(Booking.customer_id == current_user.id)
    elif current_user.role == UserRole.PROVIDER:
        # Get provider profile
        p = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
        if p:
            query = query.filter(Booking.provider_id == p.id)
        else:
            return []
    # Admin sees all

    if status_filter:
        query = query.filter(Booking.status == status_filter)

    bookings = query.order_by(Booking.created_at.desc()).all()

    results = []
    for b in bookings:
        results.append({
            "id": b.id,
            "booking_code": b.booking_code,
            "status": b.status.value,
            "service_name": b.service.name if b.service else "Towing",
            "vehicle": f"{b.vehicle_brand} {b.vehicle_model} ({b.vehicle_plate})",
            "problem": b.problem_type,
            "pickup_address": b.pickup_address,
            "destination_address": b.destination_address,
            "estimated_price": b.estimated_price,
            "final_price": b.final_price,
            "created_at": b.created_at,
            "provider_name": b.provider.business_name if b.provider else None
        })
    return results

@router.get("/{booking_id}")
def get_booking_details(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Authorization check
    if current_user.role == UserRole.CUSTOMER and booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view this booking")

    # Format provider info
    provider_data = None
    if booking.provider:
        p = booking.provider
        u = p.user
        provider_data = {
            "id": p.id,
            "business_name": p.business_name,
            "contact_name": u.full_name if u else "Operator",
            "phone": u.phone if u else "Emergency Line",
            "rating": p.rating,
            "total_jobs": p.total_jobs,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "vehicle": (p.vehicles[0].make_model + " (" + p.vehicles[0].license_plate + ")") if p.vehicles else "Flatbed Tow Truck"
        }

    # Format bids
    bids_data = []
    for bid in booking.bids:
        bids_data.append({
            "id": bid.id,
            "provider_id": bid.provider_id,
            "provider_name": bid.provider.business_name,
            "provider_rating": bid.provider.rating,
            "bid_amount": bid.bid_amount,
            "eta_minutes": bid.eta_minutes,
            "notes": bid.notes,
            "status": bid.status.value,
            "created_at": bid.created_at
        })

    # Format photos
    photos_data = [
        {"id": p.id, "photo_url": p.photo_url, "photo_type": p.photo_type, "label": p.ai_predicted_label, "confidence": p.ai_confidence}
        for p in booking.photos
    ]

    # Payment / invoice details
    payment_data = None
    if booking.payment:
        pay = booking.payment
        payment_data = {
            "id": pay.id,
            "amount": pay.amount,
            "status": pay.status.value,
            "method": pay.payment_method,
            "invoice_number": pay.invoice.invoice_number if pay.invoice else None,
            "paid_at": pay.created_at
        }

    return {
        "id": booking.id,
        "booking_code": booking.booking_code,
        "status": booking.status.value,
        "dispatch_mode": booking.dispatch_mode.value,
        "service": {
            "id": booking.service.id,
            "name": booking.service.name,
            "slug": booking.service.slug,
            "icon": booking.service.icon
        },
        "vehicle": {
            "type": booking.vehicle_type,
            "brand": booking.vehicle_brand,
            "model": booking.vehicle_model,
            "plate": booking.vehicle_plate,
            "fuel": booking.fuel_type,
            "condition": booking.vehicle_condition
        },
        "problem": {
            "type": booking.problem_type,
            "description": booking.problem_description
        },
        "location": {
            "pickup_address": booking.pickup_address,
            "pickup_lat": booking.pickup_lat,
            "pickup_lng": booking.pickup_lng,
            "destination_address": booking.destination_address,
            "destination_lat": booking.destination_lat,
            "destination_lng": booking.destination_lng,
            "distance_km": booking.estimated_distance_km
        },
        "pricing": {
            "estimated_price": booking.estimated_price,
            "final_price": booking.final_price,
            "eta_minutes": booking.estimated_eta_minutes
        },
        "provider": provider_data,
        "bids": bids_data,
        "photos": photos_data,
        "payment": payment_data,
        "created_at": booking.created_at,
        "completed_at": booking.completed_at
    }

@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    status_update: BookingStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.status in [BookingStatus.COMPLETED, BookingStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel booking with status {booking.status.value}")

    booking.status = BookingStatus.CANCELLED
    booking.cancellation_reason = status_update.cancellation_reason or "Cancelled by user"
    db.commit()

    # Notify via WebSocket
    await ws_manager.broadcast_to_booking(booking.id, {
        "type": "STATUS_CHANGED",
        "status": "CANCELLED",
        "reason": booking.cancellation_reason
    })

    return {"success": True, "status": "CANCELLED", "message": "Booking has been cancelled."}

@router.post("/{booking_id}/accept-bid/{bid_id}")
async def accept_provider_bid(
    booking_id: int,
    bid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")

    bid = db.query(ProviderBid).filter(ProviderBid.id == bid_id, ProviderBid.booking_id == booking_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found for this booking")

    # Accept this bid
    bid.status = BidStatus.ACCEPTED
    booking.provider_id = bid.provider_id
    booking.final_price = bid.bid_amount
    booking.estimated_eta_minutes = bid.eta_minutes
    booking.status = BookingStatus.PROVIDER_ASSIGNED

    # Reject other bids
    other_bids = db.query(ProviderBid).filter(
        ProviderBid.booking_id == booking_id,
        ProviderBid.id != bid_id
    ).all()
    for ob in other_bids:
        ob.status = BidStatus.REJECTED

    db.commit()

    # WebSocket broadcast
    await ws_manager.broadcast_to_booking(booking.id, {
        "type": "BID_ACCEPTED",
        "provider_id": bid.provider_id,
        "amount": bid.bid_amount,
        "eta": bid.eta_minutes
    })

    return {
        "success": True,
        "status": booking.status.value,
        "provider_id": booking.provider_id,
        "final_price": booking.final_price
    }

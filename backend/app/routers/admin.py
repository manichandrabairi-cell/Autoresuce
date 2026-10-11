from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import (
    User, UserRole, ProviderProfile, VerificationStatus, Booking, BookingStatus,
    ProviderDocument, ProviderVehicle, Payment, PaymentStatus, Dispute, DisputeStatus,
    ServiceCategory, PricingRule
)
from app.schemas.schemas import ProviderVerificationAction, PricingRuleCreate
from app.routers.deps import require_role

router = APIRouter(prefix="/admin", tags=["Admin Portal"], dependencies=[Depends(require_role(UserRole.ADMIN))])

@router.get("/analytics")
def get_admin_analytics(db: Session = Depends(get_db)):
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_providers = db.query(ProviderProfile).count()
    pending_verifications = db.query(ProviderProfile).filter(ProviderProfile.verification_status == VerificationStatus.PENDING).count()
    active_bookings = db.query(Booking).filter(Booking.status.in_([
        BookingStatus.REQUESTED, BookingStatus.SEARCHING, BookingStatus.BIDDING,
        BookingStatus.PROVIDER_ASSIGNED, BookingStatus.EN_ROUTE, BookingStatus.ARRIVED, BookingStatus.SERVICE_IN_PROGRESS
    ])).count()
    completed_jobs = db.query(Booking).filter(Booking.status == BookingStatus.COMPLETED).count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == BookingStatus.CANCELLED).count()

    # Revenue
    completed_payments = db.query(Payment).filter(Payment.status == PaymentStatus.COMPLETED).all()
    total_gross = sum(p.amount for p in completed_payments)
    platform_revenue = round(total_gross * 0.15, 2)

    # Service distribution
    cat_counts = (
        db.query(ServiceCategory.name, func.count(Booking.id))
        .join(Booking, Booking.service_id == ServiceCategory.id, isouter=True)
        .group_by(ServiceCategory.name)
        .all()
    )
    service_distribution = [{"service": name, "count": count} for name, count in cat_counts]

    return {
        "metrics": {
            "total_customers": total_customers,
            "total_providers": total_providers,
            "pending_verifications": pending_verifications,
            "active_bookings": active_bookings,
            "completed_jobs": completed_jobs,
            "cancelled_bookings": cancelled_bookings,
            "platform_revenue": platform_revenue,
            "total_gross_volume": total_gross,
            "avg_response_time_mins": 14.8
        },
        "service_distribution": service_distribution
    }

@router.get("/providers")
def list_providers(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ProviderProfile)
    if status_filter:
        query = query.filter(ProviderProfile.verification_status == status_filter)
    providers = query.all()

    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "full_name": p.user.full_name if p.user else "Unknown",
            "email": p.user.email if p.user else "Unknown",
            "phone": p.user.phone if p.user else "N/A",
            "business_name": p.business_name,
            "service_area": p.service_area,
            "is_verified": p.is_verified,
            "verification_status": p.verification_status.value,
            "is_available": p.is_available,
            "rating": p.rating,
            "total_jobs": p.total_jobs,
            "documents_count": len(p.documents),
            "vehicles_count": len(p.vehicles),
            "created_at": p.created_at
        }
        for p in providers
    ]

@router.patch("/providers/{provider_id}/verification")
def update_provider_verification(
    provider_id: int,
    action: ProviderVerificationAction,
    db: Session = Depends(get_db)
):
    provider = db.query(ProviderProfile).filter(ProviderProfile.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    provider.verification_status = action.status
    provider.is_verified = (action.status == VerificationStatus.APPROVED)

    # Update associated documents
    for doc in provider.documents:
        doc.status = action.status
        if action.status == VerificationStatus.APPROVED:
            doc.verified_at = datetime.utcnow()
        elif action.status == VerificationStatus.REJECTED:
            doc.rejection_reason = action.rejection_reason

    db.commit()

    return {
        "success": True,
        "provider_id": provider.id,
        "verification_status": provider.verification_status.value,
        "is_verified": provider.is_verified
    }

@router.get("/customers")
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "total_bookings": len(u.bookings_as_customer)
        }
        for u in customers
    ]

@router.patch("/users/{user_id}/toggle-active")
def toggle_user_status(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"success": True, "user_id": user.id, "is_active": user.is_active}

@router.get("/bookings")
def list_all_admin_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return [
        {
            "id": b.id,
            "booking_code": b.booking_code,
            "customer_name": b.customer.full_name if b.customer else "Unknown",
            "customer_phone": b.customer.phone if b.customer else "Unknown",
            "provider_business": b.provider.business_name if b.provider else "Unassigned",
            "service_name": b.service.name if b.service else "Towing",
            "status": b.status.value,
            "dispatch_mode": b.dispatch_mode.value,
            "estimated_price": b.estimated_price,
            "final_price": b.final_price,
            "pickup_address": b.pickup_address,
            "destination_address": b.destination_address,
            "vehicle": f"{b.vehicle_brand} {b.vehicle_model} ({b.vehicle_plate})",
            "created_at": b.created_at
        }
        for b in bookings
    ]

@router.get("/disputes")
def list_disputes(db: Session = Depends(get_db)):
    disputes = db.query(Dispute).order_by(Dispute.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "booking_id": d.booking_id,
            "user_id": d.user_id,
            "reason": d.reason,
            "status": d.status.value,
            "resolution_notes": d.resolution_notes,
            "created_at": d.created_at
        }
        for d in disputes
    ]

@router.patch("/disputes/{dispute_id}/resolve")
def resolve_dispute(dispute_id: int, resolution_notes: str, status_val: DisputeStatus, db: Session = Depends(get_db)):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute.status = status_val
    dispute.resolution_notes = resolution_notes
    db.commit()
    return {"success": True, "dispute_id": dispute.id, "status": dispute.status.value}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.models import (
    User, Booking, Payment, PaymentStatus, Invoice, Review, BookingStatus, ProviderProfile
)
from app.schemas.schemas import PaymentOrderCreate, PaymentVerify, ReviewCreate
from app.routers.deps import get_current_user
from app.services.payment_service import payment_service

router = APIRouter(prefix="/payments", tags=["Payments & Invoicing"])

@router.post("/create-order")
def create_payment_order(
    req: PaymentOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    amount = booking.final_price or booking.estimated_price
    order_data = payment_service.create_order(
        amount=amount,
        currency="INR",
        receipt_id=booking.booking_code
    )

    # Check or create pending payment record
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            amount=amount,
            currency="INR",
            status=PaymentStatus.PENDING,
            razorpay_order_id=order_data["id"]
        )
        db.add(payment)
    else:
        payment.razorpay_order_id = order_data["id"]
        payment.amount = amount

    db.commit()

    return {
        "order_id": order_data["id"],
        "amount": order_data["amount"],
        "currency": order_data["currency"],
        "key_id": order_data["key_id"],
        "booking_code": booking.booking_code,
        "is_test_mode": True
    }

@router.post("/verify")
def verify_payment(
    verify_data: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == verify_data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_valid = payment_service.verify_signature(
        order_id=verify_data.razorpay_order_id,
        payment_id=verify_data.razorpay_payment_id,
        signature=verify_data.razorpay_signature
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment verification signature.")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            amount=booking.final_price or booking.estimated_price,
            currency="INR"
        )
        db.add(payment)

    payment.status = PaymentStatus.COMPLETED
    payment.razorpay_payment_id = verify_data.razorpay_payment_id
    payment.razorpay_signature = verify_data.razorpay_signature

    # Create invoice if not existing
    invoice = db.query(Invoice).filter(Invoice.booking_id == booking.id).first()
    if not invoice:
        subtotal = payment.amount
        tax = round(subtotal * 0.18, 2)
        total = round(subtotal + tax, 2)
        invoice = Invoice(
            booking_id=booking.id,
            payment_id=payment.id,
            invoice_number=payment_service.generate_invoice_number(booking.id),
            subtotal=subtotal,
            tax=tax,
            discount=0.0,
            total=total,
            issued_at=datetime.utcnow()
        )
        db.add(invoice)

    db.commit()

    return {
        "success": True,
        "status": "COMPLETED",
        "invoice_number": invoice.invoice_number,
        "amount_paid": payment.amount,
        "message": "Payment verified and digital invoice generated."
    }

@router.post("/reviews")
def submit_service_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == review_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if not booking.provider_id:
        raise HTTPException(status_code=400, detail="No provider assigned to review")

    existing = db.query(Review).filter(Review.booking_id == booking.id).first()
    if existing:
        existing.rating = review_in.rating
        existing.comment = review_in.comment
        db.commit()
        return {"success": True, "message": "Review updated"}

    review = Review(
        booking_id=booking.id,
        customer_id=current_user.id,
        provider_id=booking.provider_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(review)

    # Recalculate provider overall rating
    all_provider_reviews = db.query(Review).filter(Review.provider_id == booking.provider_id).all()
    ratings = [r.rating for r in all_provider_reviews] + [review_in.rating]
    avg_rating = round(sum(ratings) / len(ratings), 1)

    provider = db.query(ProviderProfile).filter(ProviderProfile.id == booking.provider_id).first()
    if provider:
        provider.rating = avg_rating

    db.commit()
    return {"success": True, "rating": review_in.rating, "new_provider_avg": avg_rating}

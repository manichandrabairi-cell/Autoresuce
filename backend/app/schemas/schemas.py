from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import UserRole, VerificationStatus, BookingStatus, DispatchMode, BidStatus, PaymentStatus, DisputeStatus

# Auth Schemas
class UserRegister(BaseModel):
    email: str
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CUSTOMER
    business_name: Optional[str] = None # For providers

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str

# User Schemas
class UserOut(BaseModel):
    id: int
    email: str
    phone: Optional[str]
    full_name: str
    role: UserRole
    is_active: bool
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Service Categories
class ServiceCategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    base_price: float
    per_km_rate: float
    icon: str
    turnaround_mins: int
    is_active: bool

    class Config:
        from_attributes = True

# AI Breakdown Analysis
class AIClassificationResponse(BaseModel):
    predicted_category: str
    confidence: float
    severity: str
    requires_manual_review: bool
    recommended_service: str
    disclaimer: str
    model_version: str

# Booking Schemas
class BookingCreate(BaseModel):
    service_id: int
    vehicle_type: str
    vehicle_brand: str
    vehicle_model: str
    vehicle_plate: str
    fuel_type: Optional[str] = "Petrol"
    vehicle_condition: Optional[str] = "Stationary / Immobile"
    problem_type: str
    problem_description: Optional[str] = None
    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    destination_address: Optional[str] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    dispatch_mode: DispatchMode = DispatchMode.AUTO
    photo_urls: Optional[List[str]] = []
    ai_predicted_label: Optional[str] = None
    ai_confidence: Optional[float] = None

class BookingStatusUpdate(BaseModel):
    status: BookingStatus
    cancellation_reason: Optional[str] = None

class PriceEstimateRequest(BaseModel):
    service_id: int
    vehicle_type: str
    pickup_lat: float
    pickup_lng: float
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None

class PriceEstimateResponse(BaseModel):
    base_fee: float
    distance_km: float
    distance_charge: float
    vehicle_surcharge: float
    estimated_total: float
    estimated_eta_mins: int
    currency: str = "INR"
    disclaimer: str

# Provider Bids
class ProviderBidCreate(BaseModel):
    bid_amount: float
    eta_minutes: int
    notes: Optional[str] = None

class ProviderBidOut(BaseModel):
    id: int
    booking_id: int
    provider_id: int
    bid_amount: float
    eta_minutes: int
    notes: Optional[str]
    status: BidStatus
    created_at: datetime
    provider_name: Optional[str] = None
    provider_business: Optional[str] = None
    provider_rating: Optional[float] = 4.9

    class Config:
        from_attributes = True

# Provider Models
class ProviderLocationUpdate(BaseModel):
    lat: float
    lng: float
    speed: Optional[float] = 0.0
    heading: Optional[float] = 0.0
    booking_id: Optional[int] = None

class ProviderVerificationAction(BaseModel):
    status: VerificationStatus
    rejection_reason: Optional[str] = None

class ProviderVehicleCreate(BaseModel):
    vehicle_type: str
    make_model: str
    license_plate: str
    year: int = 2023
    capacity_tons: float = 3.5

# Payment & Review
class PaymentOrderCreate(BaseModel):
    booking_id: int

class PaymentVerify(BaseModel):
    booking_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class ReviewCreate(BaseModel):
    booking_id: int
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None

class DisputeCreate(BaseModel):
    booking_id: int
    reason: str

class EnterpriseLeadCreate(BaseModel):
    company_name: str
    contact_name: str
    contact_email: str
    phone: str
    fleet_size: int = 10
    industry: Optional[str] = "Logistics"
    notes: Optional[str] = None

class PricingRuleCreate(BaseModel):
    service_category_id: Optional[int] = None
    vehicle_type: str
    base_fee: float
    per_km_rate: float
    surge_multiplier: float = 1.0

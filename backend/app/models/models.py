import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    PROVIDER = "PROVIDER"
    ADMIN = "ADMIN"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    SEARCHING = "SEARCHING"
    BIDDING = "BIDDING"
    PROVIDER_ASSIGNED = "PROVIDER_ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    ARRIVED = "ARRIVED"
    SERVICE_IN_PROGRESS = "SERVICE_IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class DispatchMode(str, enum.Enum):
    AUTO = "AUTO"
    BIDDING = "BIDDING"

class BidStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class DisputeStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    customer_profile = relationship("CustomerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    provider_profile = relationship("ProviderProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    bookings_as_customer = relationship("Booking", back_populates="customer", foreign_keys="Booking.customer_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reviews_written = relationship("Review", back_populates="customer", foreign_keys="Review.customer_id")


class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    preferred_contact = Column(String(50), default="phone")
    emergency_contact = Column(String(100), nullable=True)
    address = Column(String(255), nullable=True)

    user = relationship("User", back_populates="customer_profile")


class ProviderProfile(Base):
    __tablename__ = "provider_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String(255), nullable=False)
    service_area = Column(String(255), default="Metro Area (15km radius)")
    is_verified = Column(Boolean, default=False)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    is_available = Column(Boolean, default=True)
    rating = Column(Float, default=4.9)
    total_jobs = Column(Integer, default=0)
    bank_account = Column(String(100), nullable=True)
    latitude = Column(Float, default=12.9716) # Default city coord
    longitude = Column(Float, default=77.5946)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="provider_profile")
    documents = relationship("ProviderDocument", back_populates="provider", cascade="all, delete-orphan")
    vehicles = relationship("ProviderVehicle", back_populates="provider", cascade="all, delete-orphan")
    bids = relationship("ProviderBid", back_populates="provider")
    assigned_bookings = relationship("Booking", back_populates="provider", foreign_keys="Booking.provider_id")
    reviews_received = relationship("Review", back_populates="provider", foreign_keys="Review.provider_id")


class ProviderDocument(Base):
    __tablename__ = "provider_documents"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("provider_profiles.id"), nullable=False)
    document_type = Column(String(100), nullable=False) # DRIVING_LICENSE, COMMERCIAL_PERMIT, VEHICLE_INSURANCE, etc.
    document_url = Column(String(500), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    rejection_reason = Column(String(255), nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)

    provider = relationship("ProviderProfile", back_populates="documents")


class ProviderVehicle(Base):
    __tablename__ = "provider_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("provider_profiles.id"), nullable=False)
    vehicle_type = Column(String(100), nullable=False) # FLATBED, UNDER_LIFT, HEAVY_WRECKER, etc.
    make_model = Column(String(100), nullable=False)
    license_plate = Column(String(50), nullable=False)
    year = Column(Integer, default=2023)
    capacity_tons = Column(Float, default=3.5)
    is_active = Column(Boolean, default=True)
    verified = Column(Boolean, default=True)

    provider = relationship("ProviderProfile", back_populates="vehicles")


class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    base_price = Column(Float, nullable=False, default=49.0)
    per_km_rate = Column(Float, nullable=False, default=3.5)
    icon = Column(String(50), default="Truck")
    turnaround_mins = Column(Integer, default=25)
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="service")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_code = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("provider_profiles.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("service_categories.id"), nullable=False)

    status = Column(Enum(BookingStatus), default=BookingStatus.REQUESTED, index=True)
    dispatch_mode = Column(Enum(DispatchMode), default=DispatchMode.AUTO)

    # Vehicle details
    vehicle_type = Column(String(50), nullable=False) # Motorcycle, Sedan, SUV, etc.
    vehicle_brand = Column(String(50), nullable=False)
    vehicle_model = Column(String(50), nullable=False)
    vehicle_plate = Column(String(50), nullable=False)
    fuel_type = Column(String(50), default="Petrol")
    vehicle_condition = Column(String(50), default="Stationary / Immobile")

    # Problem details
    problem_type = Column(String(100), nullable=False)
    problem_description = Column(Text, nullable=True)

    # Location details
    pickup_address = Column(String(255), nullable=False)
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    destination_address = Column(String(255), nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)

    # Pricing & ETA
    estimated_distance_km = Column(Float, default=5.0)
    estimated_price = Column(Float, nullable=False)
    final_price = Column(Float, nullable=True)
    estimated_eta_minutes = Column(Integer, default=20)

    # Metadata
    cancellation_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    customer = relationship("User", back_populates="bookings_as_customer", foreign_keys=[customer_id])
    provider = relationship("ProviderProfile", back_populates="assigned_bookings", foreign_keys=[provider_id])
    service = relationship("ServiceCategory", back_populates="bookings")
    photos = relationship("BookingPhoto", back_populates="booking", cascade="all, delete-orphan")
    bids = relationship("ProviderBid", back_populates="booking", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="booking", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="booking", cascade="all, delete-orphan")


class BookingPhoto(Base):
    __tablename__ = "booking_photos"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    photo_url = Column(String(500), nullable=False)
    photo_type = Column(String(50), default="BREAKDOWN") # BREAKDOWN, COMPLETION
    ai_predicted_label = Column(String(100), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="photos")


class ProviderBid(Base):
    __tablename__ = "provider_bids"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("provider_profiles.id"), nullable=False)
    bid_amount = Column(Float, nullable=False)
    eta_minutes = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)
    status = Column(Enum(BidStatus), default=BidStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="bids")
    provider = relationship("ProviderProfile", back_populates="bids")


class LocationUpdate(Base):
    __tablename__ = "location_updates"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("provider_profiles.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    speed = Column(Float, default=0.0)
    heading = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="chat_messages")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")
    is_read = Column(Boolean, default=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    payment_method = Column(String(50), default="CARD")
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")
    invoice = relationship("Invoice", back_populates="payment", uselist=False, cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    payment_id = Column(Integer, ForeignKey("payments.id"), unique=True, nullable=False)
    invoice_number = Column(String(50), unique=True, nullable=False)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)

    payment = relationship("Payment", back_populates="invoice")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("provider_profiles.id"), nullable=False)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="review")
    customer = relationship("User", back_populates="reviews_written", foreign_keys=[customer_id])
    provider = relationship("ProviderProfile", back_populates="reviews_received", foreign_keys=[provider_id])


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(255), nullable=False)
    status = Column(Enum(DisputeStatus), default=DisputeStatus.OPEN)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="disputes")


class PricingRule(Base):
    __tablename__ = "pricing_rules"

    id = Column(Integer, primary_key=True, index=True)
    service_category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    vehicle_type = Column(String(50), nullable=False) # Motorcycle, Sedan, SUV, Commercial, etc.
    base_fee = Column(Float, nullable=False)
    per_km_rate = Column(Float, nullable=False)
    surge_multiplier = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class EnterpriseAccount(Base):
    __tablename__ = "enterprise_accounts"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    contact_name = Column(String(100), nullable=False)
    contact_email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    fleet_size = Column(Integer, default=10)
    industry = Column(String(100), default="Logistics")
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="NEW_LEAD")
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(50), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

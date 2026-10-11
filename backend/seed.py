import os
import sys
from datetime import datetime, timedelta

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.models import (
    User, UserRole, CustomerProfile, ProviderProfile, VerificationStatus,
    ProviderVehicle, ProviderDocument, ServiceCategory, Booking, BookingStatus,
    DispatchMode, ProviderBid, BidStatus, Payment, PaymentStatus, Invoice, Review,
    PricingRule
)

def seed_database():
    print("Dropping and re-creating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding Service Categories...")
        services_data = [
            {
                "name": "Flatbed Towing",
                "slug": "flatbed-towing",
                "description": "Premium hydraulic flatbed transport ideal for luxury cars, AWD vehicles, low-clearance sedans, and severe breakdowns.",
                "base_price": 799.0,
                "per_km_rate": 45.0,
                "icon": "Truck",
                "turnaround_mins": 20
            },
            {
                "name": "Under-Lift Towing",
                "slug": "under-lift-towing",
                "description": "Safe boom wheel-lift towing for standard 2WD hatchbacks and sedans stranded in tight city parking or ramps.",
                "base_price": 599.0,
                "per_km_rate": 35.0,
                "icon": "Car",
                "turnaround_mins": 25
            },
            {
                "name": "Two-Wheeler Towing",
                "slug": "two-wheeler-towing",
                "description": "Specialized bike ramp carrier with pneumatic harness tie-downs for motorcycles, superbikes, and scooters.",
                "base_price": 349.0,
                "per_km_rate": 25.0,
                "icon": "Bike",
                "turnaround_mins": 15
            },
            {
                "name": "Heavy Vehicle Recovery",
                "slug": "heavy-vehicle-recovery",
                "description": "Heavy-duty commercial wrecker capable of towing trucks, buses, commercial tempos, and construction equipment.",
                "base_price": 1999.0,
                "per_km_rate": 80.0,
                "icon": "ShieldAlert",
                "turnaround_mins": 35
            },
            {
                "name": "Accident Recovery",
                "slug": "accident-recovery",
                "description": "Emergency winch extraction and safe scene clearance for crash damaged or ditch-stuck vehicles.",
                "base_price": 1499.0,
                "per_km_rate": 60.0,
                "icon": "AlertTriangle",
                "turnaround_mins": 18
            },
            {
                "name": "Breakdown Towing",
                "slug": "breakdown-towing",
                "description": "Rapid towing to your nearest trusted garage or authorized dealership service center for mechanical breakdowns.",
                "base_price": 699.0,
                "per_km_rate": 40.0,
                "icon": "Wrench",
                "turnaround_mins": 20
            },
            {
                "name": "Battery Jump-Start",
                "slug": "battery-jump-start",
                "description": "On-site 12V/24V high-amperage battery boost, alternator health check, and instant ignition restart.",
                "base_price": 299.0,
                "per_km_rate": 15.0,
                "icon": "Zap",
                "turnaround_mins": 12
            },
            {
                "name": "Flat-Tyre Assistance",
                "slug": "flat-tyre-assistance",
                "description": "Spare tyre installation, puncture repair, and portable electric air compression right on the roadside.",
                "base_price": 249.0,
                "per_km_rate": 15.0,
                "icon": "CircleDot",
                "turnaround_mins": 15
            },
            {
                "name": "Emergency Fuel Delivery",
                "slug": "emergency-fuel-delivery",
                "description": "Prompt delivery of up to 5 litres of petrol or diesel directly to your stranded location to get you to a station.",
                "base_price": 299.0,
                "per_km_rate": 15.0,
                "icon": "Fuel",
                "turnaround_mins": 15
            },
            {
                "name": "EV Roadside Assistance",
                "slug": "ev-roadside-assistance",
                "description": "Specialized flatbed transport and mobile emergency EV fast-charging boost to reach the nearest charging station.",
                "base_price": 599.0,
                "per_km_rate": 30.0,
                "icon": "BatteryCharging",
                "turnaround_mins": 20
            }
        ]

        services_map = {}
        for s in services_data:
            svc = ServiceCategory(**s)
            db.add(svc)
            db.flush()
            services_map[s["slug"]] = svc

        print("Seeding Users (Customer, Providers, Admin)...")
        # 1. Customer
        customer_user = User(
            email="customer@autorescue.com",
            phone="+91 9876543210",
            hashed_password=get_password_hash("Customer123!"),
            full_name="Rajesh Kumar",
            role=UserRole.CUSTOMER,
            is_active=True
        )
        db.add(customer_user)
        db.flush()

        customer_profile = CustomerProfile(
            user_id=customer_user.id,
            emergency_contact="+91 9876500000",
            address="Indiranagar 100ft Road, Bengaluru"
        )
        db.add(customer_profile)

        # 2. Provider 1 (Verified, High Rating)
        provider1_user = User(
            email="provider@autorescue.com",
            phone="+91 9123456780",
            hashed_password=get_password_hash("Provider123!"),
            full_name="Vikram Singh",
            role=UserRole.PROVIDER,
            is_active=True
        )
        db.add(provider1_user)
        db.flush()

        provider1_profile = ProviderProfile(
            user_id=provider1_user.id,
            business_name="Apex Roadside Logistics",
            service_area="Bengaluru Metro (Central & East)",
            is_verified=True,
            verification_status=VerificationStatus.APPROVED,
            is_available=True,
            rating=4.9,
            total_jobs=142,
            bank_account="HDFC0001234 - Vikram Logistics",
            latitude=12.9716,
            longitude=77.5946
        )
        db.add(provider1_profile)
        db.flush()

        v1 = ProviderVehicle(
            provider_id=provider1_profile.id,
            vehicle_type="Hydraulic Flatbed Carrier",
            make_model="Tata 709g HD Flatbed",
            license_plate="KA-01-MJ-9921",
            year=2023,
            capacity_tons=4.5,
            is_active=True,
            verified=True
        )
        db.add(v1)

        d1 = ProviderDocument(
            provider_id=provider1_profile.id,
            document_type="COMMERCIAL_CARRIER_PERMIT",
            document_url="/uploads/demo_permit.pdf",
            status=VerificationStatus.APPROVED,
            verified_at=datetime.utcnow() - timedelta(days=30)
        )
        db.add(d1)

        # 3. Provider 2 (Verified, Quick Tow)
        provider2_user = User(
            email="quicktow@autorescue.com",
            phone="+91 9123456781",
            hashed_password=get_password_hash("Provider123!"),
            full_name="Imran Khan",
            role=UserRole.PROVIDER,
            is_active=True
        )
        db.add(provider2_user)
        db.flush()

        provider2_profile = ProviderProfile(
            user_id=provider2_user.id,
            business_name="QuickTow 24/7 Rescue",
            service_area="Bengaluru South & Outer Ring Road",
            is_verified=True,
            verification_status=VerificationStatus.APPROVED,
            is_available=True,
            rating=4.8,
            total_jobs=89,
            bank_account="ICIC0005678 - QuickTow Ventures",
            latitude=12.9352,
            longitude=77.6245
        )
        db.add(provider2_profile)
        db.flush()

        v2 = ProviderVehicle(
            provider_id=provider2_profile.id,
            vehicle_type="Wheel-Lift Heavy Wrecker",
            make_model="Ashok Leyland Dost Recovery",
            license_plate="KA-05-AB-4412",
            year=2022,
            capacity_tons=3.0,
            is_active=True,
            verified=True
        )
        db.add(v2)

        # 4. Provider 3 (Pending verification - for admin approval demonstration)
        provider3_user = User(
            email="newpartner@autorescue.com",
            phone="+91 9123456782",
            hashed_password=get_password_hash("Provider123!"),
            full_name="Kiran Reddy",
            role=UserRole.PROVIDER,
            is_active=True
        )
        db.add(provider3_user)
        db.flush()

        provider3_profile = ProviderProfile(
            user_id=provider3_user.id,
            business_name="Metro Haulers & Towing",
            service_area="Bengaluru North & Airport Corridor",
            is_verified=False,
            verification_status=VerificationStatus.PENDING,
            is_available=False,
            rating=5.0,
            total_jobs=0,
            bank_account="SBI0004321 - Metro Haulers",
            latitude=13.0358,
            longitude=77.5970
        )
        db.add(provider3_profile)
        db.flush()

        d3 = ProviderDocument(
            provider_id=provider3_profile.id,
            document_type="COMMERCIAL_LICENSE_APPL",
            document_url="/uploads/demo_pending_doc.pdf",
            status=VerificationStatus.PENDING
        )
        db.add(d3)

        # 5. Admin User
        admin_user = User(
            email="admin@autorescue.com",
            phone="+91 9999988888",
            hashed_password=get_password_hash("Admin123!"),
            full_name="System Administrator",
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin_user)
        db.flush()

        print("Seeding Realistic Bookings in Various Lifecycles...")

        # Booking 1: Live EN_ROUTE Tracking Booking for Customer
        b1 = Booking(
            booking_code="AR-84920",
            customer_id=customer_user.id,
            provider_id=provider1_profile.id,
            service_id=services_map["flatbed-towing"].id,
            status=BookingStatus.EN_ROUTE,
            dispatch_mode=DispatchMode.AUTO,
            vehicle_type="Sedan",
            vehicle_brand="Honda",
            vehicle_model="City ZX",
            vehicle_plate="KA-03-HA-8120",
            fuel_type="Petrol",
            vehicle_condition="Engine Overheated / Stalled",
            problem_type="Engine failure / Overheating",
            problem_description="Coolant leak detected on expressway; engine steam visible under bonnet.",
            pickup_address="MG Road near Trinity Metro Station, Bengaluru",
            pickup_lat=12.9738,
            pickup_lng=77.6119,
            destination_address="Whitefield Honda Authorized Service Center",
            destination_lat=12.9856,
            destination_lng=77.7289,
            estimated_distance_km=14.2,
            estimated_price=1438.0,
            final_price=1438.0,
            estimated_eta_minutes=11,
            created_at=datetime.utcnow() - timedelta(minutes=24)
        )
        db.add(b1)
        db.flush()

        # Booking 2: Competitive Bidding Active Booking
        b2 = Booking(
            booking_code="AR-77142",
            customer_id=customer_user.id,
            service_id=services_map["breakdown-towing"].id,
            status=BookingStatus.BIDDING,
            dispatch_mode=DispatchMode.BIDDING,
            vehicle_type="SUV",
            vehicle_brand="Hyundai",
            vehicle_model="Creta 1.5 SX",
            vehicle_plate="KA-04-MB-5091",
            fuel_type="Diesel",
            vehicle_condition="Flat Tyre & Damaged Rim",
            problem_type="Flat tyre / Rim bent",
            problem_description="Hit a severe pothole; tyre shredded and alloy rim bent.",
            pickup_address="Koramangala 80ft Road, Sony Signal",
            pickup_lat=12.9344,
            pickup_lng=77.6288,
            destination_address="Bosch Car Care, HSR Layout Sector 1",
            destination_lat=12.9121,
            destination_lng=77.6446,
            estimated_distance_km=7.5,
            estimated_price=999.0,
            final_price=999.0,
            estimated_eta_minutes=15,
            created_at=datetime.utcnow() - timedelta(minutes=10)
        )
        db.add(b2)
        db.flush()

        # Competing Bids for Booking 2
        bid1 = ProviderBid(
            booking_id=b2.id,
            provider_id=provider1_profile.id,
            bid_amount=950.0,
            eta_minutes=12,
            notes="Ready with hydraulic lift and heavy duty jack. 12 mins ETA.",
            status=BidStatus.PENDING
        )
        bid2 = ProviderBid(
            booking_id=b2.id,
            provider_id=provider2_profile.id,
            bid_amount=890.0,
            eta_minutes=16,
            notes="Nearby Sony World signal right now. Affordable competitive quote.",
            status=BidStatus.PENDING
        )
        db.add_all([bid1, bid2])

        # Booking 3: Completed Booking with Payment, Invoice, Review
        b3 = Booking(
            booking_code="AR-63211",
            customer_id=customer_user.id,
            provider_id=provider1_profile.id,
            service_id=services_map["battery-jump-start"].id,
            status=BookingStatus.COMPLETED,
            dispatch_mode=DispatchMode.AUTO,
            vehicle_type="Hatchback",
            vehicle_brand="Maruti Suzuki",
            vehicle_model="Swift ZXi",
            vehicle_plate="KA-01-EQ-1049",
            fuel_type="Petrol",
            vehicle_condition="Dead Battery / No Crank",
            problem_type="Battery failure",
            problem_description="Headlights left on overnight; battery drained completely.",
            pickup_address="Jayanagar 4th Block, Bengaluru",
            pickup_lat=12.9299,
            pickup_lng=77.5824,
            destination_address=None,
            estimated_distance_km=4.0,
            estimated_price=359.0,
            final_price=359.0,
            estimated_eta_minutes=14,
            created_at=datetime.utcnow() - timedelta(days=2),
            completed_at=datetime.utcnow() - timedelta(days=2, hours=-1)
        )
        db.add(b3)
        db.flush()

        pay3 = Payment(
            booking_id=b3.id,
            user_id=customer_user.id,
            amount=359.0,
            currency="INR",
            status=PaymentStatus.COMPLETED,
            razorpay_order_id="order_seed_99382101",
            razorpay_payment_id="pay_seed_84712093",
            razorpay_signature="sim_sig_verified_mock_9921",
            payment_method="UPI / Razorpay"
        )
        db.add(pay3)
        db.flush()

        inv3 = Invoice(
            booking_id=b3.id,
            payment_id=pay3.id,
            invoice_number="INV-20261008-0003",
            subtotal=359.0,
            tax=64.62,
            discount=0.0,
            total=423.62
        )
        db.add(inv3)

        rev3 = Review(
            booking_id=b3.id,
            customer_id=customer_user.id,
            provider_id=provider1_profile.id,
            rating=5.0,
            comment="Technician arrived with a high-capacity jump pack in 12 mins. Started right away!"
        )
        db.add(rev3)

        db.commit()
        print("Database seeded successfully!")
        print("Accounts created:")
        print(" - Customer: customer@autorescue.com / Customer123!")
        print(" - Provider (Verified): provider@autorescue.com / Provider123!")
        print(" - Provider 2 (Verified): quicktow@autorescue.com / Provider123!")
        print(" - Provider 3 (Pending): newpartner@autorescue.com / Provider123!")
        print(" - Admin: admin@autorescue.com / Admin123!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

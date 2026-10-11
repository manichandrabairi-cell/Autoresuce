import sys
import httpx

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    print("==================================================")
    print("STARTING AUTORESCUE WORKFLOW VALIDATION TESTS")
    print("==================================================")

    client = httpx.Client(base_url=BASE_URL, timeout=15.0)

    # 1. TEST SERVICES AND STATS
    print("\n[TEST 1] Testing Public Services & Stats Endpoints...")
    res = client.get("/services")
    assert res.status_code == 200, f"Services failed: {res.text}"
    services = res.json()
    assert len(services) >= 10, f"Expected 10 services, got {len(services)}"
    print(f"[PASS] Retrieved {len(services)} roadside services successfully.")

    res = client.get("/stats")
    assert res.status_code == 200
    stats = res.json()
    assert stats["verified_providers"] > 0
    print(f"[PASS] Retrieved platform statistics: {stats['completed_rescues']} completed rescues.")

    # 2. WORKFLOW A: Customer Registration -> Login -> Price Estimate -> Create Booking
    print("\n[WORKFLOW A] Customer Registration -> Login -> Estimate -> Booking Creation...")
    import uuid
    rand_email = f"driver_{uuid.uuid4().hex[:6]}@test.com"

    reg_res = client.post("/auth/register", json={
        "email": rand_email,
        "password": "Password123!",
        "full_name": "Test Pilot Driver",
        "phone": f"+91 99{uuid.uuid4().hex[:8]}",
        "role": "CUSTOMER"
    })
    assert reg_res.status_code == 200, f"Customer registration failed: {reg_res.text}"
    customer_token = reg_res.json()["access_token"]
    customer_headers = {"Authorization": f"Bearer {customer_token}"}
    print(f"[PASS] Customer registered: {rand_email}")

    # Estimate price
    est_res = client.post("/bookings/estimate", json={
        "service_id": services[0]["id"],
        "vehicle_type": "Sedan",
        "pickup_lat": 12.9716,
        "pickup_lng": 77.5946,
        "destination_lat": 12.9856,
        "destination_lng": 77.7289
    })
    assert est_res.status_code == 200, f"Estimate failed: {est_res.text}"
    est_data = est_res.json()
    assert est_data["estimated_total"] > 0
    print(f"[PASS] Estimate calculated: {est_data['estimated_total']} INR for {est_data['distance_km']} km.")

    # Create Booking in Mode B (Bidding)
    booking_res = client.post("/bookings", json={
        "service_id": services[0]["id"],
        "vehicle_type": "Sedan",
        "vehicle_brand": "Honda",
        "vehicle_model": "City",
        "vehicle_plate": "KA-01-AB-9999",
        "problem_type": "Engine failure",
        "pickup_address": "Indiranagar 100ft Road",
        "pickup_lat": 12.9716,
        "pickup_lng": 77.5946,
        "destination_address": "Authorized Garage",
        "destination_lat": 12.9856,
        "destination_lng": 77.7289,
        "dispatch_mode": "BIDDING"
    }, headers=customer_headers)
    assert booking_res.status_code == 200, f"Booking creation failed: {booking_res.text}"
    booking_data = booking_res.json()
    booking_id = booking_data["id"]
    print(f"[PASS] Created incident {booking_data['booking_code']} in BIDDING mode (ID: {booking_id})")

    # 3. WORKFLOW B: Provider discovers job -> Submits Bid -> Customer accepts bid
    print("\n[WORKFLOW B] Provider Bidding -> Customer Acceptance -> Tracking Starts...")
    # Login verified provider
    prov_login = client.post("/auth/login", json={
        "email": "provider@autorescue.com",
        "password": "Provider123!"
    })
    assert prov_login.status_code == 200, f"Provider login failed: {prov_login.text}"
    provider_token = prov_login.json()["access_token"]
    provider_headers = {"Authorization": f"Bearer {provider_token}"}

    # Provider submits bid
    bid_res = client.post(f"/providers/jobs/{booking_id}/bid", json={
        "bid_amount": 1250.0,
        "eta_minutes": 14,
        "notes": "Flatbed tow truck ready near Trinity signal."
    }, headers=provider_headers)
    assert bid_res.status_code == 200, f"Bid submission failed: {bid_res.text}"
    bid_id = bid_res.json()["bid_id"]
    print(f"[PASS] Provider submitted bid: {bid_id} for 1250 INR")

    # Customer accepts bid
    accept_res = client.post(f"/bookings/{booking_id}/accept-bid/{bid_id}", headers=customer_headers)
    assert accept_res.status_code == 200, f"Bid acceptance failed: {accept_res.text}"
    assert accept_res.json()["status"] == "PROVIDER_ASSIGNED"
    print("[PASS] Customer accepted provider bid! Status transitioned to PROVIDER_ASSIGNED.")

    # 4. WORKFLOW C: Provider status progression -> Customer payment -> Invoice -> Review
    print("\n[WORKFLOW C] Driver En Route -> Arrived -> Completed -> Payment -> Review...")
    # Driver marks EN_ROUTE
    stat1 = client.patch(f"/providers/jobs/{booking_id}/status", json={"status": "EN_ROUTE"}, headers=provider_headers)
    assert stat1.status_code == 200
    print("[PASS] Provider status: EN_ROUTE")

    # Driver marks ARRIVED
    stat2 = client.patch(f"/providers/jobs/{booking_id}/status", json={"status": "ARRIVED"}, headers=provider_headers)
    assert stat2.status_code == 200
    print("[PASS] Provider status: ARRIVED")

    # Driver marks COMPLETED
    stat3 = client.patch(f"/providers/jobs/{booking_id}/status", json={"status": "COMPLETED"}, headers=provider_headers)
    assert stat3.status_code == 200
    print("[PASS] Provider status: COMPLETED")

    # Customer verifies payment order
    order_res = client.post("/payments/create-order", json={"booking_id": booking_id}, headers=customer_headers)
    assert order_res.status_code == 200
    order_info = order_res.json()
    print(f"[PASS] Payment order created: {order_info['order_id']}")

    # Customer verifies payment with Razorpay test token
    verify_res = client.post("/payments/verify", json={
        "booking_id": booking_id,
        "razorpay_order_id": order_info["order_id"],
        "razorpay_payment_id": "pay_test_9981245",
        "razorpay_signature": "sim_sig_verified_mock_9921"
    }, headers=customer_headers)
    assert verify_res.status_code == 200
    inv_info = verify_res.json()
    print(f"[PASS] Payment verified! Generated tax invoice: {inv_info['invoice_number']}")

    # Customer submits rating
    rev_res = client.post("/payments/reviews", json={
        "booking_id": booking_id,
        "rating": 5.0,
        "comment": "Exceptional rapid arrival and safe flatbed hauling."
    }, headers=customer_headers)
    assert rev_res.status_code == 200
    print(f"[PASS] Customer submitted 5-star review! New provider rating: {rev_res.json()['new_provider_avg']}")

    # 5. WORKFLOW D: New Provider Registration -> Admin Approval
    print("\n[WORKFLOW D] New Partner Registration -> Document Review -> Admin Approval...")
    new_prov_email = f"partner_{uuid.uuid4().hex[:6]}@test.com"
    new_prov_res = client.post("/auth/register", json={
        "email": new_prov_email,
        "password": "Provider123!",
        "full_name": "Suresh Patel",
        "phone": f"+91 91{uuid.uuid4().hex[:8]}",
        "role": "PROVIDER",
        "business_name": "Patel Heavy Towing"
    })
    assert new_prov_res.status_code == 200
    new_prov_data = new_prov_res.json()
    new_prov_id = new_prov_data["user"]["id"]
    print(f"[PASS] Partner registered: {new_prov_email} (User ID: {new_prov_id})")

    # Login Admin
    admin_login = client.post("/auth/login", json={
        "email": "admin@autorescue.com",
        "password": "Admin123!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Find provider profile
    provs = client.get("/admin/providers", headers=admin_headers).json()
    target_prov = next((p for p in provs if p["email"] == new_prov_email), None)
    assert target_prov is not None
    assert target_prov["verification_status"] == "PENDING"
    print(f"[PASS] Admin retrieved unverified applicant: {target_prov['business_name']}")

    # Admin approves provider
    approve_res = client.patch(f"/admin/providers/{target_prov['id']}/verification", json={
        "status": "APPROVED"
    }, headers=admin_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["is_verified"] == True
    print(f"[PASS] Admin approved provider {target_prov['id']}! Partner is now verified for production dispatches.")

    # 6. WORKFLOW E: Booking Cancellation
    print("\n[WORKFLOW E] Booking Cancellation Validation...")
    # Create another booking to cancel
    cancel_booking_res = client.post("/bookings", json={
        "service_id": services[1]["id"],
        "vehicle_type": "Hatchback",
        "vehicle_brand": "Maruti",
        "vehicle_model": "Swift",
        "vehicle_plate": "KA-05-XY-1234",
        "problem_type": "Flat tyre",
        "pickup_address": "MG Road",
        "pickup_lat": 12.9716,
        "pickup_lng": 77.5946,
        "dispatch_mode": "AUTO"
    }, headers=customer_headers)
    assert cancel_booking_res.status_code == 200
    c_booking_id = cancel_booking_res.json()["id"]

    cancel_res = client.patch(f"/bookings/{c_booking_id}/cancel", json={
        "status": "CANCELLED",
        "cancellation_reason": "Vehicle tire reinflated with spare pump"
    }, headers=customer_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "CANCELLED"
    print(f"[PASS] Booking {c_booking_id} cancelled cleanly with recorded reason.")

    print("\n==================================================")
    print("ALL 5 COMPLETE WORKFLOWS VALIDATED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

-- AutoRescue PostgreSQL + PostGIS Schema Definition
-- Run this script on your PostgreSQL instance with PostGIS enabled:
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TYPE user_role AS ENUM ('CUSTOMER', 'PROVIDER', 'ADMIN');
CREATE TYPE verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE booking_status AS ENUM (
    'REQUESTED', 'SEARCHING', 'BIDDING', 'PROVIDER_ASSIGNED',
    'EN_ROUTE', 'ARRIVED', 'SERVICE_IN_PROGRESS', 'COMPLETED', 'CANCELLED'
);
CREATE TYPE dispatch_mode AS ENUM ('AUTO', 'BIDDING');
CREATE TYPE bid_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE dispute_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'CUSTOMER',
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_contact VARCHAR(50) DEFAULT 'phone',
    emergency_contact VARCHAR(100),
    address VARCHAR(255)
);

-- Provider profiles with PostGIS geometry
CREATE TABLE IF NOT EXISTS provider_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    service_area VARCHAR(255) DEFAULT 'Metro Area',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'PENDING',
    is_available BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 4.9,
    total_jobs INTEGER DEFAULT 0,
    bank_account VARCHAR(100),
    latitude FLOAT DEFAULT 12.9716,
    longitude FLOAT DEFAULT 77.5946,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for PostGIS provider coordinates (when geometry column is enabled)
-- ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS geom geometry(Point, 4326);
-- CREATE INDEX IF NOT EXISTS idx_provider_geom ON provider_profiles USING GIST (geom);

-- Service categories
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    base_price FLOAT NOT NULL,
    per_km_rate FLOAT NOT NULL,
    icon VARCHAR(50) DEFAULT 'Truck',
    turnaround_mins INTEGER DEFAULT 25,
    is_active BOOLEAN DEFAULT TRUE
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES users(id) NOT NULL,
    provider_id INTEGER REFERENCES provider_profiles(id),
    service_id INTEGER REFERENCES service_categories(id) NOT NULL,
    status booking_status DEFAULT 'REQUESTED',
    dispatch_mode dispatch_mode DEFAULT 'AUTO',
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_brand VARCHAR(50) NOT NULL,
    vehicle_model VARCHAR(50) NOT NULL,
    vehicle_plate VARCHAR(50) NOT NULL,
    fuel_type VARCHAR(50) DEFAULT 'Petrol',
    vehicle_condition VARCHAR(50) DEFAULT 'Stationary',
    problem_type VARCHAR(100) NOT NULL,
    problem_description TEXT,
    pickup_address VARCHAR(255) NOT NULL,
    pickup_lat FLOAT NOT NULL,
    pickup_lng FLOAT NOT NULL,
    destination_address VARCHAR(255),
    destination_lat FLOAT,
    destination_lng FLOAT,
    estimated_distance_km FLOAT DEFAULT 5.0,
    estimated_price FLOAT NOT NULL,
    final_price FLOAT,
    estimated_eta_minutes INTEGER DEFAULT 20,
    cancellation_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);

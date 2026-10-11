export type UserRole = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type BookingStatus =
  | 'REQUESTED'
  | 'SEARCHING'
  | 'BIDDING'
  | 'PROVIDER_ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'SERVICE_IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type DispatchMode = 'AUTO' | 'BIDDING';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  provider_info?: {
    provider_id: number;
    business_name: string;
    is_verified: boolean;
    verification_status: VerificationStatus;
    is_available: boolean;
    rating?: number;
    total_jobs?: number;
  };
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  per_km_rate: number;
  icon: string;
  turnaround_mins: number;
}

export interface ProviderBid {
  id: number;
  provider_id: number;
  provider_name: string;
  provider_rating: number;
  bid_amount: number;
  eta_minutes: number;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  created_at: string;
}

export interface BookingPhoto {
  id: number;
  photo_url: string;
  photo_type: string;
  label?: string;
  confidence?: number;
}

export interface BookingDetails {
  id: number;
  booking_code: string;
  status: BookingStatus;
  dispatch_mode: DispatchMode;
  service: {
    id: number;
    name: string;
    slug: string;
    icon: string;
  };
  vehicle: {
    type: string;
    brand: string;
    model: string;
    plate: string;
    fuel: string;
    condition: string;
  };
  problem: {
    type: string;
    description?: string;
  };
  location: {
    pickup_address: string;
    pickup_lat: number;
    pickup_lng: number;
    destination_address?: string;
    destination_lat?: number;
    destination_lng?: number;
    distance_km: number;
  };
  pricing: {
    estimated_price: number;
    final_price?: number;
    eta_minutes: number;
  };
  provider?: {
    id: number;
    business_name: string;
    contact_name: string;
    phone: string;
    rating: number;
    total_jobs: number;
    latitude: number;
    longitude: number;
    vehicle: string;
  };
  bids: ProviderBid[];
  photos: BookingPhoto[];
  payment?: {
    id: number;
    amount: number;
    status: string;
    method: string;
    invoice_number?: string;
    paid_at: string;
  };
  created_at: string;
  completed_at?: string;
}

export interface AIClassificationResult {
  predicted_category: string;
  label: string;
  confidence: number;
  severity: string;
  requires_manual_review: boolean;
  recommended_service: string;
  disclaimer: string;
  model_version: string;
  image_url: string;
}

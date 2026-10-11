from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import (
    ProviderProfile, VerificationStatus, Booking, BookingStatus, DispatchMode, ProviderBid, BidStatus
)
from app.services.pricing_service import haversine_distance_km

class DispatchService:
    @staticmethod
    def find_eligible_providers(
        db: Session,
        pickup_lat: float,
        pickup_lng: float,
        radius_km: float = 15.0,
        vehicle_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Finds verified and available providers within radius.
        Strictly excludes unverified or suspended providers.
        """
        # Fetch only approved and available providers
        providers = (
            db.query(ProviderProfile)
            .filter(
                ProviderProfile.is_verified == True,
                ProviderProfile.verification_status == VerificationStatus.APPROVED,
                ProviderProfile.is_available == True
            )
            .all()
        )

        eligible = []
        for p in providers:
            # Check coordinate distance
            dist = haversine_distance_km(pickup_lat, pickup_lng, p.latitude, p.longitude)
            if dist <= radius_km:
                eligible.append({
                    "provider": p,
                    "distance_km": dist,
                    "eta_minutes": max(10, int(dist * 2.5 + 8)),
                    "score": round((5.0 - (dist / 10.0)) + (p.rating * 1.5), 2)
                })

        # Sort by best combined score (closest + highest rating)
        eligible.sort(key=lambda x: x["score"], reverse=True)
        return eligible

    @staticmethod
    def auto_dispatch_job(db: Session, booking: Booking) -> Optional[ProviderProfile]:
        """
        Mode A: Assigns the best available verified provider immediately.
        """
        eligible = DispatchService.find_eligible_providers(
            db, booking.pickup_lat, booking.pickup_lng, radius_km=25.0, vehicle_type=booking.vehicle_type
        )
        if not eligible:
            return None

        best_provider = eligible[0]["provider"]
        booking.provider_id = best_provider.id
        booking.status = BookingStatus.PROVIDER_ASSIGNED
        booking.estimated_eta_minutes = eligible[0]["eta_minutes"]
        db.commit()
        db.refresh(booking)
        return best_provider

    @staticmethod
    def start_bidding_dispatch(db: Session, booking: Booking) -> int:
        """
        Mode B: Opens booking for competitive bids among eligible verified providers.
        """
        eligible = DispatchService.find_eligible_providers(
            db, booking.pickup_lat, booking.pickup_lng, radius_km=30.0, vehicle_type=booking.vehicle_type
        )
        booking.status = BookingStatus.BIDDING
        db.commit()
        db.refresh(booking)
        return len(eligible)

dispatch_service = DispatchService()

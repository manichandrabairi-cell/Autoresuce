import math
from typing import Dict, Any, Optional

VEHICLE_MULTIPLIERS = {
    "Motorcycle": 0.75,
    "Scooter": 0.75,
    "Hatchback": 1.0,
    "Sedan": 1.0,
    "SUV": 1.25,
    "Commercial vehicle": 1.75,
    "Bus or heavy vehicle": 2.20
}

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes geographical great-circle distance in kilometers.
    """
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class PricingService:
    @staticmethod
    def calculate_estimate(
        base_fee: float,
        per_km_rate: float,
        pickup_lat: float,
        pickup_lng: float,
        destination_lat: Optional[float],
        destination_lng: Optional[float],
        vehicle_type: str = "Sedan"
    ) -> Dict[str, Any]:
        """
        Calculates upfront estimated breakdown pricing.
        """
        # If destination is specified, calculate towing distance; else default 6.0km dispatch travel
        if destination_lat is not None and destination_lng is not None:
            distance_km = haversine_distance_km(pickup_lat, pickup_lng, destination_lat, destination_lng)
            # Add minimal 2km for provider transit if very close
            distance_km = max(distance_km, 3.0)
        else:
            distance_km = 6.0

        multiplier = VEHICLE_MULTIPLIERS.get(vehicle_type, 1.0)
        distance_charge = round(distance_km * per_km_rate * multiplier, 2)
        vehicle_surcharge = round((base_fee * (multiplier - 1.0)) if multiplier > 1.0 else 0.0, 2)
        adjusted_base = round(base_fee * min(multiplier, 1.0), 2)

        total = round(adjusted_base + distance_charge + vehicle_surcharge, 2)

        # Estimate arrival time based on distance (approx 2.5 min per km + 10 min prep)
        eta_minutes = int(min(60, max(12, round(distance_km * 2.2 + 8))))

        return {
            "base_fee": adjusted_base,
            "distance_km": distance_km,
            "distance_charge": distance_charge,
            "vehicle_surcharge": vehicle_surcharge,
            "estimated_total": total,
            "estimated_eta_mins": eta_minutes,
            "currency": "INR",
            "disclaimer": "Upfront estimate based on standard rates. Confirmed bids or final road toll charges may adjust final total."
        }

pricing_service = PricingService()

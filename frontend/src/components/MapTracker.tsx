import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Play, Pause, RefreshCw } from 'lucide-react';

// Custom icons using SVG data URIs
const customerIcon = new L.DivIcon({
  html: `<div style="background-color:#ef4444;width:32px;height:32px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.3);">
          <div style="width:10px;height:10px;background-color:white;border-radius:50%;"></div>
        </div>`,
  className: 'custom-customer-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const providerIcon = new L.DivIcon({
  html: `<div style="background-color:#0f2744;width:38px;height:38px;border-radius:50%;border:3px solid #f97316;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 12px rgba(0,0,0,0.35);">
          <span style="font-size:18px;">🚛</span>
        </div>`,
  className: 'custom-tow-pin',
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const destinationIcon = new L.DivIcon({
  html: `<div style="background-color:#10b981;width:32px;height:32px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 6px rgba(0,0,0,0.3);">
          <span style="font-size:14px;color:white;font-weight:bold;">🏁</span>
        </div>`,
  className: 'custom-dest-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapRecenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

interface MapTrackerProps {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  destinationLat?: number;
  destinationLng?: number;
  destinationAddress?: string;
  initialProviderLat?: number;
  initialProviderLng?: number;
  providerName?: string;
  isEnRoute?: boolean;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export const MapTracker: React.FC<MapTrackerProps> = ({
  pickupLat,
  pickupLng,
  pickupAddress,
  destinationLat,
  destinationLng,
  destinationAddress,
  initialProviderLat = pickupLat - 0.015,
  initialProviderLng = pickupLng - 0.015,
  providerName = 'Apex Roadside Logistics',
  isEnRoute = true,
  onLocationUpdate
}) => {
  const [providerCoords, setProviderCoords] = useState<[number, number]>([
    initialProviderLat,
    initialProviderLng,
  ]);
  const [isSimulating, setIsSimulating] = useState<boolean>(isEnRoute);

  // Smooth provider movement simulation towards pickup location
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProviderCoords((prev) => {
        const dLat = pickupLat - prev[0];
        const dLng = pickupLng - prev[1];
        const distanceRemaining = Math.sqrt(dLat * dLat + dLng * dLng);

        if (distanceRemaining < 0.0005) {
          setIsSimulating(false);
          return [pickupLat, pickupLng];
        }

        // Move 5% closer every step
        const step = 0.04;
        const nextLat = prev[0] + dLat * step;
        const nextLng = prev[1] + dLng * step;

        if (onLocationUpdate) {
          onLocationUpdate(nextLat, nextLng);
        }

        return [nextLat, nextLng];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, pickupLat, pickupLng, onLocationUpdate]);

  const routePolyline: [number, number][] = [
    providerCoords,
    [pickupLat, pickupLng],
    ...(destinationLat && destinationLng ? [[destinationLat, destinationLng] as [number, number]] : []),
  ];

  return (
    <div className="relative w-full h-[360px] md:h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <MapContainer
        center={[pickupLat, pickupLng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter coords={providerCoords} />

        {/* Pickup Pin */}
        <Marker position={[pickupLat, pickupLng]} icon={customerIcon}>
          <Popup>
            <div className="p-1 font-sans">
              <strong className="text-rose-600 block text-xs uppercase tracking-wider">Breakdown Location</strong>
              <p className="text-slate-800 text-sm mt-0.5">{pickupAddress}</p>
            </div>
          </Popup>
        </Marker>

        {/* Tow Truck Pin */}
        <Marker position={providerCoords} icon={providerIcon}>
          <Popup>
            <div className="p-1 font-sans">
              <strong className="text-blue-900 block text-xs uppercase tracking-wider">Rescue Unit Active</strong>
              <p className="font-semibold text-slate-800 text-sm">{providerName}</p>
              <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">En Route</span>
            </div>
          </Popup>
        </Marker>

        {/* Destination Pin (if garage selected) */}
        {destinationLat && destinationLng && (
          <Marker position={[destinationLat, destinationLng]} icon={destinationIcon}>
            <Popup>
              <div className="p-1 font-sans">
                <strong className="text-emerald-700 block text-xs uppercase tracking-wider">Destination Garage</strong>
                <p className="text-slate-800 text-sm mt-0.5">{destinationAddress || 'Drop-off Garage'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Polyline Route */}
        <Polyline positions={routePolyline} color="#0f2744" weight={4} dashArray="6, 8" opacity={0.8} />
      </MapContainer>

      {/* Floating Simulation Controls */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-lg flex items-center space-x-2 text-xs">
        <span className="flex items-center text-slate-600 font-medium">
          <Navigation className="w-3.5 h-3.5 mr-1 text-orange-500" />
          Live GPS
        </span>
        <button
          type="button"
          onClick={() => setIsSimulating(!isSimulating)}
          className={`flex items-center px-2 py-1 rounded font-medium transition ${
            isSimulating ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
          }`}
        >
          {isSimulating ? (
            <>
              <Pause className="w-3 h-3 mr-1" /> Pause Tracker
            </>
          ) : (
            <>
              <Play className="w-3 h-3 mr-1" /> Resume Tracker
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setProviderCoords([pickupLat - 0.015, pickupLng - 0.015]);
            setIsSimulating(true);
          }}
          title="Reset Provider Location"
          className="p-1 hover:bg-slate-100 rounded text-slate-500"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

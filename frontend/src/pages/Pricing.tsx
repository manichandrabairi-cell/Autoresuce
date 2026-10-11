import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calculator, CheckCircle2, ShieldCheck, ArrowRight, Info, Percent } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ServiceCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(1);
  const [selectedVehicle, setSelectedVehicle] = useState('Sedan');
  const [distanceKm, setDistanceKm] = useState<number>(12);

  useEffect(() => {
    apiRequest<ServiceCategory[]>('/services')
      .then((data) => {
        setServices(data);
        if (data.length > 0) setSelectedServiceId(data[0].id);
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  const vehicleMultipliers: Record<string, number> = {
    Motorcycle: 0.75,
    Scooter: 0.75,
    Hatchback: 1.0,
    Sedan: 1.0,
    SUV: 1.25,
    'Commercial vehicle': 1.75,
  };

  const mult = vehicleMultipliers[selectedVehicle] || 1.0;
  const basePrice = selectedService ? selectedService.base_price * Math.min(mult, 1.0) : 799;
  const perKmRate = selectedService ? selectedService.per_km_rate : 45;
  const distanceCost = Math.round(distanceKm * perKmRate * mult);
  const total = Math.round(basePrice + distanceCost);

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
            Zero Hidden Fees
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-3">
            Transparent, Regulated Pricing Engine
          </h1>
          <p className="text-slate-600 mt-3 text-base">
            No roadside bargaining, no inflated late-night quotes. Verified upfront estimates calculated by official GPS telemetry.
          </p>
        </div>

        {/* Pricing Formula Callout */}
        <div className="bg-[#0f2744] text-white rounded-3xl p-8 mb-14 shadow-xl border border-slate-800">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-orange-400 font-mono text-xs uppercase tracking-widest">
              Standardized Rate Formulation
            </span>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700 font-mono text-sm sm:text-base text-orange-300">
              Estimated Total = Base Service Fee + (Billable Distance × Rate / KM × Vehicle Multiplier)
            </div>
            <p className="text-xs text-slate-300">
              * Official demonstration rates shown. Bids submitted by competitive independent providers may offer personalized discounts.
            </p>
          </div>
        </div>

        {/* Interactive Estimator and Rates Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Interactive Estimator */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-xl border-b border-slate-100 pb-4">
              <Calculator className="w-5 h-5 text-orange-500" />
              <span>Live Upfront Rate Estimator</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Roadside Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Base: {formatCurrency(s.base_price)}, {formatCurrency(s.per_km_rate)}/km)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Vehicle Class Tier
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Motorcycle">Two-Wheeler / Bike (0.75x)</option>
                <option value="Hatchback">Hatchback (1.0x)</option>
                <option value="Sedan">Sedan (1.0x)</option>
                <option value="SUV">SUV / MUV (1.25x)</option>
                <option value="Commercial vehicle">Commercial / Van (1.75x)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span>3. Estimated Towing Distance</span>
                <span className="text-orange-600 font-extrabold">{distanceKm} KM</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Base Service Dispatch:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Distance Cost ({distanceKm} km @ {mult}x):</span>
                <span className="font-semibold text-slate-800">{formatCurrency(distanceCost)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200 text-slate-900">
                <span>Estimated Upfront Fare:</span>
                <span className="text-orange-600 font-extrabold">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/customer/book?serviceId=${selectedServiceId}&vehicle=${selectedVehicle}`)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>Book With This Estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Vehicle Multiplier Tier Table */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              Vehicle Classification Tiers
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Heavier chassis and low-ground-clearance platforms require specialized hydraulic tilt ramps, heavy-duty snatch blocks, and wider flatbeds:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold">Examples</th>
                    <th className="py-2.5 font-bold text-right">Coefficient</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Two-Wheeler</td>
                    <td className="py-3 text-xs text-slate-500">Motorcycles, Scooters, EV Bikes</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-600">0.75x</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Compact / Sedan</td>
                    <td className="py-3 text-xs text-slate-500">Swift, i20, City, Verna</td>
                    <td className="py-3 text-right font-mono font-bold text-slate-800">1.00x</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">SUV / MUV</td>
                    <td className="py-3 text-xs text-slate-500">Creta, Fortuner, Innova, Safari</td>
                    <td className="py-3 text-right font-mono font-bold text-orange-600">1.25x</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Commercial / Vans</td>
                    <td className="py-3 text-xs text-slate-500">Tata Ace, Bolero Maxi, Travellers</td>
                    <td className="py-3 text-right font-mono font-bold text-orange-700">1.75x</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-slate-900">Heavy Trucks / Buses</td>
                    <td className="py-3 text-xs text-slate-500">Multi-axle commercial coaches</td>
                    <td className="py-3 text-right font-mono font-bold text-rose-600">2.20x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

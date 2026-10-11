import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Truck, CheckCircle, Calculator, Info } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ServiceCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const ServiceDetail: React.FC = () => {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculator state
  const [calcDistance, setCalcDistance] = useState<number>(10);
  const [calcVehicle, setCalcVehicle] = useState<string>('Sedan');

  useEffect(() => {
    if (!serviceSlug) return;
    apiRequest<ServiceCategory>(`/services/${serviceSlug}`)
      .then((data) => {
        setService(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [serviceSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-4">
        <h2 className="text-2xl font-bold text-slate-800">Service Not Found</h2>
        <p className="text-slate-500 mt-2">The requested roadside service could not be located.</p>
        <Link to="/services" className="mt-4 px-4 py-2 bg-[#0f2744] text-white rounded-xl text-sm font-semibold">
          Return to Services Directory
        </Link>
      </div>
    );
  }

  // Calculate preview estimate
  const vehicleMultipliers: Record<string, number> = {
    Motorcycle: 0.75,
    Hatchback: 1.0,
    Sedan: 1.0,
    SUV: 1.25,
    'Commercial vehicle': 1.75
  };
  const mult = vehicleMultipliers[calcVehicle] || 1.0;
  const distanceCharge = Math.round(calcDistance * service.per_km_rate * mult);
  const baseCharge = Math.round(service.base_price * Math.min(mult, 1.0));
  const estimatedTotal = baseCharge + distanceCharge;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-6 font-medium">
          <Link to="/" className="hover:text-slate-800">Home</Link>
          <span>/</span>
          <Link to="/services" className="hover:text-slate-800">Services</Link>
          <span>/</span>
          <span className="text-orange-600 font-semibold">{service.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold mb-4">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Fast Response • ~{service.turnaround_mins} mins ETA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {service.name}
              </h1>

              <p className="text-slate-600 mt-4 leading-relaxed text-base">
                {service.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Base Dispatch Fee</span>
                  <span className="text-2xl font-black text-[#0f2744] mt-1 block">{formatCurrency(service.base_price)}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Standard Distance Rate</span>
                  <span className="text-2xl font-black text-slate-800 mt-1 block">{formatCurrency(service.per_km_rate)} / km</span>
                </div>
              </div>
            </div>

            {/* Standard Inclusions */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Standard Inclusions & Safety Protocols</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Licensed and verified commercial recovery vehicle with dual hydraulic winch system.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Pneumatic tie-down wheel straps preventing rim scratches or chassis stress.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Highway hazard beacon triangles and safety perimeter deployment on arrival.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Digital pre-tow and post-tow inspection photograph logs stored in your account.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing Calculator Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg sticky top-28 space-y-6">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-lg border-b border-slate-100 pb-4">
                <Calculator className="w-5 h-5 text-orange-500" />
                <span>Estimate Towing Fare</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Vehicle Category
                </label>
                <select
                  value={calcVehicle}
                  onChange={(e) => setCalcVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Motorcycle">Two-Wheeler / Motorcycle (0.75x)</option>
                  <option value="Hatchback">Hatchback (1.0x)</option>
                  <option value="Sedan">Sedan (1.0x)</option>
                  <option value="SUV">SUV / Compact MUV (1.25x)</option>
                  <option value="Commercial vehicle">Commercial / Van (1.75x)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  <span>Estimated Distance</span>
                  <span className="text-orange-600 font-extrabold">{calcDistance} KM</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="60"
                  value={calcDistance}
                  onChange={(e) => setCalcDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>2 km</span>
                  <span>30 km</span>
                  <span>60 km</span>
                </div>
              </div>

              {/* Estimate Calculation Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Service Fee:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(baseCharge)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Distance Charge ({calcDistance} km):</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(distanceCharge)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-slate-900">
                  <span>Estimated Total:</span>
                  <span className="text-orange-600 font-extrabold text-base">{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-slate-500">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Estimated upfront rate. Real odometer distance calculated automatically via live GPS route.</span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/customer/book?serviceId=${service.id}&vehicle=${calcVehicle}`)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition flex items-center justify-center space-x-2 text-sm"
              >
                <span>Book This Service Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

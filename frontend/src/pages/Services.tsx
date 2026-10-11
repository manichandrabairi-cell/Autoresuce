import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Car, Zap, CircleDot, Fuel, BatteryCharging, AlertTriangle, Wrench, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ServiceCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TOWING' | 'ROADSIDE' | 'SPECIAL'>('ALL');

  useEffect(() => {
    apiRequest<ServiceCategory[]>('/services')
      .then(setServices)
      .catch((err) => console.error(err));
  }, []);

  const getServiceIcon = (icon: string) => {
    switch (icon) {
      case 'Truck': return <Truck className="w-6 h-6 text-orange-500" />;
      case 'Car': return <Car className="w-6 h-6 text-orange-500" />;
      case 'Zap': return <Zap className="w-6 h-6 text-orange-500" />;
      case 'CircleDot': return <CircleDot className="w-6 h-6 text-orange-500" />;
      case 'Fuel': return <Fuel className="w-6 h-6 text-orange-500" />;
      case 'BatteryCharging': return <BatteryCharging className="w-6 h-6 text-orange-500" />;
      case 'AlertTriangle': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default: return <Wrench className="w-6 h-6 text-orange-500" />;
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'TOWING') return s.slug.includes('towing') || s.slug.includes('recovery');
    if (activeFilter === 'ROADSIDE') return s.slug.includes('jump') || s.slug.includes('tyre') || s.slug.includes('fuel');
    if (activeFilter === 'SPECIAL') return s.slug.includes('ev') || s.slug.includes('heavy') || s.slug.includes('accident');
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
            Service Directory
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-3">
            Roadside Assistance & Towing Solutions
          </h1>
          <p className="text-slate-600 mt-2 text-base">
            Certified equipment, licensed operators, and guaranteed upfront pricing across all vehicle categories.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-10 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g., flatbed, battery, tyre)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto no-scrollbar">
            {(['ALL', 'TOWING', 'ROADSIDE', 'SPECIAL'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeFilter === tab
                    ? 'bg-[#0f2744] text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All Services (10)' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                    {getServiceIcon(svc.icon)}
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    ~{svc.turnaround_mins} mins
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{svc.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {svc.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-semibold">Base Rate</span>
                    <span className="text-xl font-black text-[#0f2744]">{formatCurrency(svc.base_price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block uppercase font-semibold">Per KM Rate</span>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(svc.per_km_rate)} / km</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/services/${svc.slug}`}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-3 rounded-xl text-center transition"
                  >
                    Details & Rates
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate(`/customer/book?serviceId=${svc.id}`)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl text-center transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Filter, Navigation, ArrowRight } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';

export const CustomerBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/bookings')
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = bookings.filter((b) => {
    if (filter === 'ACTIVE') {
      return ['REQUESTED', 'SEARCHING', 'BIDDING', 'PROVIDER_ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'SERVICE_IN_PROGRESS'].includes(b.status);
    }
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Activity Records</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">My Rescue Incidents</h1>
          </div>

          <div className="flex space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filter === tab ? 'bg-[#0f2744] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-slate-500 text-sm">No incidents found in this filter category.</p>
              <Link to="/customer/book" className="inline-block px-5 py-2.5 bg-orange-500 text-white font-bold rounded-xl text-xs">
                Book Assistance Now
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((b) => {
                const badge = getStatusBadge(b.status);
                return (
                  <div key={b.id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/60 p-3 rounded-2xl transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-slate-900">{b.booking_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-400">{formatDate(b.created_at)}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-800">{b.service_name} • {b.problem}</h4>
                      <p className="text-xs text-slate-500">{b.pickup_address}</p>
                      <p className="text-xs text-slate-400">Vehicle: {b.vehicle}</p>
                    </div>

                    <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">Total Fare</span>
                        <span className="text-lg font-black text-slate-900">{formatCurrency(b.final_price || b.estimated_price)}</span>
                      </div>

                      <Link
                        to={`/customer/track/${b.id}`}
                        className="bg-[#0f2744] hover:bg-[#0a1b30] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-orange-400" />
                        <span>Live Radar</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

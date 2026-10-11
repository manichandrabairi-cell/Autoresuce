import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Truck, Clock, ArrowRight, CheckCircle, Car, MapPin } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
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

  const activeBooking = bookings.find((b) =>
    ['REQUESTED', 'SEARCHING', 'BIDDING', 'PROVIDER_ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'SERVICE_IN_PROGRESS'].includes(b.status)
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Customer Portal</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Welcome back, {user?.full_name || 'Driver'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">24/7 Roadside Assistance protection active on your account.</p>
          </div>

          <button
            onClick={() => navigate('/customer/book')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center space-x-2 text-sm transition"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Request Assistance Now</span>
          </button>
        </div>

        {/* Active Emergency Banner */}
        {activeBooking && (
          <div className="bg-[#0f2744] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
                <span className="text-orange-400 font-bold text-xs uppercase tracking-wider">Active Incident Dispatch</span>
                <span className="text-slate-400 text-xs font-mono">• {activeBooking.booking_code}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">{activeBooking.service_name} In Progress</h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                Location: {activeBooking.pickup_address} • Vehicle: {activeBooking.vehicle}
              </p>
            </div>

            <Link
              to={`/customer/track/${activeBooking.id}`}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm flex items-center space-x-2 shadow-md transition whitespace-nowrap"
            >
              <span>Open Live GPS Radar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <Clock className="w-6 h-6 text-orange-500 mb-2" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Rescues</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{bookings.length}</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <CheckCircle className="w-6 h-6 text-emerald-500 mb-2" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <Truck className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Saved Vehicle</span>
            <span className="text-base font-bold text-slate-900 mt-1 block truncate">Honda City (KA-03-HA-8120)</span>
          </div>
        </div>

        {/* Recent Rescues Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Service History</h3>
            <Link to="/customer/bookings" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
              View All History
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No rescue requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                    <th className="py-3 font-bold">Booking</th>
                    <th className="py-3 font-bold">Service</th>
                    <th className="py-3 font-bold">Location</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold">Fare</th>
                    <th className="py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bookings.slice(0, 5).map((b) => {
                    const badge = getStatusBadge(b.status);
                    return (
                      <tr key={b.id} className="hover:bg-slate-50 transition">
                        <td className="py-4 font-mono font-bold text-slate-900">{b.booking_code}</td>
                        <td className="py-4 font-semibold text-slate-800">{b.service_name}</td>
                        <td className="py-4 text-xs text-slate-500 max-w-xs truncate">{b.pickup_address}</td>
                        <td className="py-4">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-slate-900">{formatCurrency(b.final_price || b.estimated_price)}</td>
                        <td className="py-4 text-right">
                          <Link
                            to={`/customer/track/${b.id}`}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                          >
                            Radar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

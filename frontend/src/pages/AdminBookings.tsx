import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatDate, getStatusBadge } from '@/lib/utils';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/admin/bookings')
      .then((data) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = bookings.filter((b) =>
    b.booking_code.toLowerCase().includes(search.toLowerCase()) ||
    b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    b.service_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Platform Supervision</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Global Incident Log</h1>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code, customer, service..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                  <th className="py-3 font-bold">Code</th>
                  <th className="py-3 font-bold">Customer</th>
                  <th className="py-3 font-bold">Assigned Partner</th>
                  <th className="py-3 font-bold">Service</th>
                  <th className="py-3 font-bold">Status</th>
                  <th className="py-3 font-bold">Fare</th>
                  <th className="py-3 font-bold text-right">Radar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((b) => {
                  const badge = getStatusBadge(b.status);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 font-mono font-bold text-slate-900">{b.booking_code}</td>
                      <td className="py-4">
                        <span className="font-semibold text-slate-800 block">{b.customer_name}</span>
                        <span className="text-xs text-slate-400">{b.customer_phone}</span>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-700">{b.provider_business}</td>
                      <td className="py-4 text-xs font-semibold text-slate-800">{b.service_name}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-900">{formatCurrency(b.final_price || b.estimated_price)}</td>
                      <td className="py-4 text-right">
                        <Link
                          to={`/customer/track/${b.id}`}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
                        >
                          View Radar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

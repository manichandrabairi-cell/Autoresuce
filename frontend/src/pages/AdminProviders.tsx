import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, AlertTriangle, CheckCircle, Clock, Truck, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const AdminProviders: React.FC = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchProviders = async () => {
    try {
      const data = await apiRequest('/admin/providers');
      setProviders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleVerificationAction = async (providerId: number, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      await apiRequest(`/admin/providers/${providerId}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          rejection_reason: status === 'REJECTED' ? 'Documents could not be verified by compliance team.' : undefined
        }),
      });
      fetchProviders();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const filtered = providers.filter((p) => {
    if (filter === 'PENDING') return p.verification_status === 'PENDING';
    if (filter === 'APPROVED') return p.verification_status === 'APPROVED';
    if (filter === 'REJECTED') return p.verification_status === 'REJECTED';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Vetting Operations</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Provider Verification Queue</h1>
            <p className="text-slate-500 text-sm mt-0.5">Approve, reject, or suspend commercial recovery operators.</p>
          </div>

          <div className="flex space-x-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
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

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-500 text-sm py-8 text-center">No providers in this queue.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <div key={p.id} className="py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-lg text-slate-900">{p.business_name}</h4>
                      {p.verification_status === 'APPROVED' ? (
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                          Approved
                        </span>
                      ) : p.verification_status === 'PENDING' ? (
                        <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
                          Pending Approval
                        </span>
                      ) : (
                        <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                          {p.verification_status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">
                      Owner: <strong>{p.full_name}</strong> • Email: {p.email} • Phone: {p.phone}
                    </p>
                    <p className="text-xs text-slate-500">Service Area: {p.service_area}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                      <span>{p.documents_count} Compliance Docs</span>
                      <span>•</span>
                      <span>{p.vehicles_count} Registered Trucks</span>
                      <span>•</span>
                      <span>{p.total_jobs} Total Rescues</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
                    {p.verification_status !== 'APPROVED' && (
                      <button
                        onClick={() => handleVerificationAction(p.id, 'APPROVED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Partner</span>
                      </button>
                    )}

                    {p.verification_status === 'PENDING' && (
                      <button
                        onClick={() => handleVerificationAction(p.id, 'REJECTED')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    )}

                    {p.verification_status === 'APPROVED' && (
                      <button
                        onClick={() => handleVerificationAction(p.id, 'SUSPENDED')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-xl text-xs transition"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

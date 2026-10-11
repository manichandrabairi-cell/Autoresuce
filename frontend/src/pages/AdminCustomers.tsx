import React, { useState, useEffect } from 'react';
import { User, CheckCircle2, XCircle, Search } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    try {
      const data = await apiRequest('/admin/customers');
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleUser = async (userId: number) => {
    try {
      await apiRequest(`/admin/users/${userId}/toggle-active`, { method: 'PATCH' });
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const filtered = customers.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">User Governance</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Customer Accounts</h1>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
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
                  <th className="py-3 font-bold">Driver Name</th>
                  <th className="py-3 font-bold">Email</th>
                  <th className="py-3 font-bold">Phone</th>
                  <th className="py-3 font-bold">Status</th>
                  <th className="py-3 font-bold">Joined</th>
                  <th className="py-3 font-bold text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 font-bold text-slate-900">{c.full_name}</td>
                    <td className="py-4 text-xs text-slate-600">{c.email}</td>
                    <td className="py-4 text-xs font-mono text-slate-600">{c.phone || 'N/A'}</td>
                    <td className="py-4">
                      {c.is_active ? (
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-4 text-xs text-slate-400">{formatDate(c.created_at)}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => toggleUser(c.id)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                          c.is_active
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {c.is_active ? 'Suspend Account' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

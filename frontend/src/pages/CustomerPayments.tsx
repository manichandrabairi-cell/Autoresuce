import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, ShieldCheck, Printer } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export const CustomerPayments: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/bookings')
      .then((data) => {
        setBookings(data.filter((b) => b.status === 'COMPLETED'));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Financial Statements</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Tax Invoices & Digital Receipts</h1>
          <p className="text-slate-500 text-sm mt-0.5">GST-compliant digital invoices for personal records or enterprise reimbursement.</p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          {loading ? (
            <div className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No completed invoices found yet. Invoices appear automatically upon service completion and online payment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-400 uppercase">
                    <th className="py-3 font-bold">Invoice Number</th>
                    <th className="py-3 font-bold">Incident Code</th>
                    <th className="py-3 font-bold">Service Category</th>
                    <th className="py-3 font-bold">Amount Settled</th>
                    <th className="py-3 font-bold">Date Issued</th>
                    <th className="py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 font-mono font-bold text-slate-900">INV-202610-{b.id.toString().padStart(4, '0')}</td>
                      <td className="py-4 font-mono text-xs text-slate-600">{b.booking_code}</td>
                      <td className="py-4 font-semibold text-slate-800">{b.service_name}</td>
                      <td className="py-4 font-bold text-emerald-700">{formatCurrency(b.final_price || b.estimated_price)}</td>
                      <td className="py-4 text-xs text-slate-500">{formatDate(b.created_at)}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Truck, ShieldAlert, CheckCircle, Clock, DollarSign,
  TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Activity
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/admin/analytics')
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const m = analytics?.metrics || {};

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Administrative Operations</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Platform Control & Analytics</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time marketplace telemetry, operator vetting, and dispatch oversight.</p>
          </div>

          <div className="flex space-x-3">
            <Link
              to="/admin/providers"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Provider Approvals ({m.pending_verifications || 0})</span>
            </Link>
            <Link
              to="/admin/bookings"
              className="bg-[#0f2744] hover:bg-[#0a1b30] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
            >
              <Activity className="w-4 h-4 text-orange-400" />
              <span>All Incidents</span>
            </Link>
          </div>
        </div>

        {/* 8 Overview KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Customers</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{m.total_customers || 0}</span>
            <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">Active Registered Drivers</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Providers</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{m.total_providers || 0}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">{m.pending_verifications || 0} pending review</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Emergencies</span>
            <span className="text-3xl font-black text-orange-600 mt-1 block">{m.active_bookings || 0}</span>
            <span className="text-[11px] text-orange-700 mt-1 block font-semibold">On Radar Live</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Rescues</span>
            <span className="text-3xl font-black text-[#0f2744] mt-1 block">{m.completed_jobs || 0}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Successfully closed</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Platform Revenue</span>
            <span className="text-3xl font-black text-emerald-700 mt-1 block">{formatCurrency(m.platform_revenue || 0)}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">15% net take-rate</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Volume</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">{formatCurrency(m.total_gross_volume || 0)}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Total settled payments</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg Response Time</span>
            <span className="text-3xl font-black text-blue-900 mt-1 block">{m.avg_response_time_mins || 14.8}m</span>
            <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">Urban corridor SLA</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cancellation Rate</span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {m.cancelled_bookings || 0}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Resolved before roll</span>
          </div>
        </div>

        {/* Service Category Breakdown Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Breakdown Incident Distribution By Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(analytics?.service_distribution || []).map((item: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">{item.service}</span>
                <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200 text-xs">
                  {item.count} Incidents
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck, DollarSign, Star, ShieldCheck, AlertCircle, Clock, CheckCircle2,
  Navigation, Play, Pause, Power, ArrowRight, FileText
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getStatusBadge } from '@/lib/utils';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<any>(null);
  const [jobsData, setJobsData] = useState<{ assigned_jobs: any[]; available_jobs: any[] }>({
    assigned_jobs: [],
    available_jobs: []
  });
  const [loading, setLoading] = useState(true);

  // Bidding modal state
  const [biddingJob, setBiddingJob] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<number>(850);
  const [bidEta, setBidEta] = useState<number>(15);
  const [bidNotes, setBidNotes] = useState<string>('Ready with hydraulic flatbed. Can reach in 15 mins.');
  const [submittingBid, setSubmittingBid] = useState(false);

  const fetchData = async () => {
    try {
      const [dash, jobs] = await Promise.all([
        apiRequest('/providers/dashboard'),
        apiRequest('/providers/jobs')
      ]);
      setDashboard(dash);
      setJobsData(jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000);
    return () => clearInterval(interval);
  }, []);

  const toggleAvailability = async () => {
    try {
      await apiRequest('/providers/availability', { method: 'PATCH' });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle availability');
    }
  };

  const advanceJobStatus = async (jobId: number, nextStatus: string) => {
    try {
      await apiRequest(`/providers/jobs/${jobId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Status transition failed');
    }
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingJob) return;
    setSubmittingBid(true);
    try {
      await apiRequest(`/providers/jobs/${biddingJob.id}/bid`, {
        method: 'POST',
        body: JSON.stringify({
          bid_amount: bidAmount,
          eta_minutes: bidEta,
          notes: bidNotes
        }),
      });
      setBiddingJob(null);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const isVerified = dashboard?.is_verified;
  const isOnline = dashboard?.is_available;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Online/Offline Toggle */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Service Partner Portal</span>
              {isVerified ? (
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified Operator
                </span>
              ) : (
                <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                  Verification Pending
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{dashboard?.business_name}</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Commercial Towing & Incident Dispatch Terminal</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleAvailability}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-sm transition ${
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? 'Online (Accepting Jobs)' : 'Offline (Paused)'}</span>
            </button>
          </div>
        </div>

        {/* Verification Warning if not verified */}
        {!isVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-amber-950">Account Awaiting Administrative Approval</strong>
              Your submitted documents (commercial permit, driver license) are under review. You can review marketplace requests, but jobs cannot be accepted until verified.
              <div className="mt-2">
                <Link to="/provider/documents" className="font-bold underline text-amber-800">
                  Inspect Submitted Verification Documents →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Gross Earnings</span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              {formatCurrency(dashboard?.earnings?.gross || 0)}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Net: {formatCurrency(dashboard?.earnings?.net || 0)} (15% platform fee)</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Dispatches</span>
            <span className="text-2xl sm:text-3xl font-black text-orange-600 mt-1 block">
              {dashboard?.active_jobs_count || 0}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Jobs currently on radar</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Jobs Completed</span>
            <span className="text-2xl sm:text-3xl font-black text-[#0f2744] mt-1 block">
              {dashboard?.total_jobs || 0}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">100% verified recoveries</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Driver Rating</span>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">{dashboard?.rating || 4.9}</span>
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">Top Tier Partner</span>
          </div>
        </div>

        {/* Assigned Active Jobs Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center">
              <Truck className="w-5 h-5 text-orange-500 mr-2" />
              Assigned Dispatches & Status Progression
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {jobsData.assigned_jobs.length} Active / Recent Jobs
            </span>
          </div>

          {jobsData.assigned_jobs.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No jobs currently assigned to your tow unit.</p>
          ) : (
            <div className="space-y-4">
              {jobsData.assigned_jobs.map((job) => {
                const badge = getStatusBadge(job.status);
                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{job.booking_code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {job.service_name}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">{job.vehicle} • {job.problem}</h4>
                      <p className="text-xs text-slate-500">Pickup: {job.pickup_address}</p>
                      {job.destination_address && (
                        <p className="text-xs text-slate-500">Drop-off: {job.destination_address}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                      <div className="text-right mr-3">
                        <span className="text-[11px] text-slate-400 block uppercase font-bold">Fare</span>
                        <span className="text-lg font-black text-slate-900">{formatCurrency(job.final_price || job.estimated_price)}</span>
                      </div>

                      {/* Progression status buttons */}
                      {job.status === 'PROVIDER_ASSIGNED' && (
                        <button
                          onClick={() => advanceJobStatus(job.id, 'EN_ROUTE')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition"
                        >
                          Mark En Route 🚛
                        </button>
                      )}

                      {job.status === 'EN_ROUTE' && (
                        <button
                          onClick={() => advanceJobStatus(job.id, 'ARRIVED')}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition"
                        >
                          Mark Arrived 📍
                        </button>
                      )}

                      {job.status === 'ARRIVED' && (
                        <button
                          onClick={() => advanceJobStatus(job.id, 'SERVICE_IN_PROGRESS')}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition"
                        >
                          Start Recovery 🔧
                        </button>
                      )}

                      {job.status === 'SERVICE_IN_PROGRESS' && (
                        <button
                          onClick={() => advanceJobStatus(job.id, 'COMPLETED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition"
                        >
                          Complete Job ✓
                        </button>
                      )}

                      <Link
                        to={`/customer/track/${job.id}`}
                        className="p-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold"
                        title="View GPS Track"
                      >
                        <Navigation className="w-4 h-4 text-orange-500" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Marketplace Open Bidding Board */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                Nearby Open Requests & Competitive Bidding
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jobs requesting competitive quotes within your 25 km service territory.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              {jobsData.available_jobs.length} Open Inquiries
            </span>
          </div>

          {jobsData.available_jobs.length === 0 ? (
            <p className="text-slate-500 text-sm py-4">No open marketplace requests in your radius currently.</p>
          ) : (
            <div className="space-y-4">
              {jobsData.available_jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-purple-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{job.booking_code}</span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {job.service_name}
                      </span>
                      <span className="text-xs text-slate-400">Est. Dist: {job.estimated_distance_km} KM</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800">{job.vehicle} • {job.problem}</h4>
                    <p className="text-xs text-slate-500">{job.pickup_address}</p>
                  </div>

                  <div className="flex items-center space-x-4 w-full md:w-auto justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-bold">Estimated Base</span>
                      <span className="text-lg font-black text-slate-900">{formatCurrency(job.estimated_price)}</span>
                    </div>

                    <button
                      type="button"
                      disabled={!isVerified}
                      onClick={() => {
                        setBiddingJob(job);
                        setBidAmount(Math.round(job.estimated_price * 0.95));
                      }}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition"
                    >
                      {job.has_provider_bid ? 'Update Bid' : 'Submit Bid Offer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      {biddingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              Submit Competitive Bid ({biddingJob.booking_code})
            </h3>
            <p className="text-xs text-slate-500">
              Customer: {biddingJob.vehicle} • {biddingJob.service_name}
            </p>

            <form onSubmit={submitBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Bid Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Arrival Time (Minutes)
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={60}
                  value={bidEta}
                  onChange={(e) => setBidEta(Number(e.target.value))}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes / Vehicle Equipment
                </label>
                <input
                  type="text"
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="Heavy duty hydraulic lift ready..."
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBiddingJob(null)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBid}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition"
                >
                  {submittingBid ? 'Submitting...' : 'Send Bid to Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

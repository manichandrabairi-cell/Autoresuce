import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert, Phone, MessageSquare, AlertTriangle, CheckCircle,
  Truck, Navigation, Clock, CreditCard, Star, RefreshCw, XCircle, ArrowLeft, Download,
  Radio, CheckCircle2, ShieldCheck, FileText, Printer
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { BookingDetails } from '@/types';
import { MapTracker } from '@/components/MapTracker';
import { ChatDrawer } from '@/components/ChatDrawer';
import { PaymentModal } from '@/components/PaymentModal';
import { ReviewModal } from '@/components/ReviewModal';
import { formatCurrency, getStatusBadge } from '@/lib/utils';

export const LiveTracking: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Vehicle started / solved');

  const fetchBooking = async () => {
    try {
      const data = await apiRequest<BookingDetails>(`/bookings/${bookingId}`);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const handleAcceptBid = async (bidId: number) => {
    try {
      await apiRequest(`/bookings/${bookingId}/accept-bid/${bidId}`, {
        method: 'POST',
      });
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Could not accept bid');
    }
  };

  const handleCancelBooking = async () => {
    try {
      await apiRequest(`/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'CANCELLED',
          cancellation_reason: cancelReason
        }),
      });
      setIsCancelConfirmOpen(false);
      await fetchBooking();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-slate-600 font-bold text-xs uppercase tracking-wider">Connecting To AutoRescue GPS Radar...</p>
        </div>
      </div>
    );
  }

  if (!booking || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-2xl font-bold text-slate-800">Booking Telemetry Unavailable</h3>
        <p className="text-slate-500 mt-1 max-w-md text-xs sm:text-sm">{error || 'Could not find the requested booking record.'}</p>
        <Link to="/customer/bookings" className="mt-4 px-5 py-2.5 bg-[#0f2744] text-white rounded-xl text-xs font-bold">
          View All Bookings
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(booking.status);

  const statusSteps = [
    'REQUESTED',
    'PROVIDER_ASSIGNED',
    'EN_ROUTE',
    'ARRIVED',
    'SERVICE_IN_PROGRESS',
    'COMPLETED'
  ];
  const currentStepIdx = statusSteps.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Tactical Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/customer/bookings')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">Incident {booking.booking_code}</span>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {booking.service.name} • {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.plate})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchBooking}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Refresh Radar</span>
            </button>

            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
              <button
                onClick={() => setIsCancelConfirmOpen(true)}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Request</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Stepper Progression Bar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[540px]">
            {['Dispatched', 'Assigned', 'En Route', 'Arrived', 'In Service', 'Completed'].map((label, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={label} className="flex-1 flex flex-col items-center relative text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition ${
                      isPast
                        ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25'
                        : 'bg-slate-100 text-slate-400'
                    } ${isCurrent ? 'ring-4 ring-orange-200 animate-pulse' : ''}`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[11px] font-bold ${isPast ? 'text-slate-900' : 'text-slate-400'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Map View Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                  <Navigation className="w-4 h-4 text-orange-500" />
                  <span>Real-Time GPS Route Telemetry</span>
                </div>
                {booking.provider && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                    Radar Active • ~{booking.pricing.eta_minutes} mins ETA
                  </span>
                )}
              </div>

              {/* Map Tracker Component */}
              <MapTracker
                pickupLat={booking.location.pickup_lat}
                pickupLng={booking.location.pickup_lng}
                pickupAddress={booking.location.pickup_address}
                destinationLat={booking.location.destination_lat}
                destinationLng={booking.location.destination_lng}
                destinationAddress={booking.location.destination_address}
                initialProviderLat={booking.provider ? booking.provider.latitude : booking.location.pickup_lat - 0.015}
                initialProviderLng={booking.provider ? booking.provider.longitude : booking.location.pickup_lng - 0.015}
                providerName={booking.provider?.business_name || 'Assigned Driver'}
                isEnRoute={booking.status === 'EN_ROUTE'}
              />
            </div>

            {/* Competitive Bidding Panel (Mode B active) */}
            {booking.status === 'BIDDING' && (
              <div className="bg-white rounded-3xl p-6 border border-purple-200 shadow-md space-y-4">
                <div className="flex justify-between items-center border-b border-purple-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      Mode B: Live Bidding Active
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">Review & Accept Driver Bids</h3>
                  </div>
                  <Clock className="w-5 h-5 text-purple-500 animate-spin" />
                </div>

                {booking.bids.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs sm:text-sm">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto mb-2"></div>
                    Broadcasting incident to nearby operators... Incoming bids appear automatically.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {booking.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className="p-4 rounded-2xl border border-slate-200 hover:border-purple-400 bg-slate-50/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{bid.provider_name}</span>
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                              {bid.provider_rating}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{bid.notes || 'Equipped with hydraulic lift'}</p>
                          <span className="text-xs text-emerald-700 font-semibold block mt-1">ETA: ~{bid.eta_minutes} mins</span>
                        </div>

                        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between">
                          <span className="text-lg font-black text-[#0f2744]">{formatCurrency(bid.bid_amount)}</span>
                          <button
                            type="button"
                            onClick={() => handleAcceptBid(bid.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                          >
                            Accept Offer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Driver Telemetry & Settlement */}
          <div className="lg:col-span-4 space-y-6">
            {/* Driver Profile Card */}
            {booking.provider ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Assigned Recovery Unit
                </span>

                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0f2744] text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {booking.provider.business_name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900 leading-tight">{booking.provider.business_name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Operator: {booking.provider.contact_name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                        {booking.provider.rating}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">({booking.provider.total_jobs} rescues)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tow Equipment:</span>
                    <span className="font-semibold text-slate-800">{booking.provider.vehicle}</span>
                  </div>
                </div>

                {/* Driver Communication Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="py-3 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>In-App Chat</span>
                  </button>

                  <a
                    href={`tel:${booking.provider.phone}`}
                    className="py-3 px-3 bg-[#0f2744] hover:bg-[#0a1b30] text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition text-center"
                  >
                    <Phone className="w-4 h-4 text-orange-400" />
                    <span>Call Driver</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
                <Clock className="w-10 h-10 text-orange-500 mx-auto animate-spin" />
                <h4 className="font-bold text-slate-900 text-base">Searching For Nearest Unit</h4>
                <p className="text-xs text-slate-500">
                  Scanning PostGIS spatial radius of 15 km for certified recovery operators.
                </p>
              </div>
            )}

            {/* Price & Settlement Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Billing & Digital Receipt
              </span>

              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Total Agreed Fare:</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(booking.pricing.final_price || booking.pricing.estimated_price)}
                </span>
              </div>

              {booking.payment?.status === 'COMPLETED' ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
                    <span className="flex items-center font-bold">
                      <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" />
                      Paid & Settled
                    </span>
                    <span className="font-mono font-bold">{booking.payment.invoice_number}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Tax Invoice</span>
                    </button>
                    <button
                      onClick={() => setIsReviewOpen(true)}
                      className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate Driver</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Settle & Pay Online</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* In-App Live Chat Drawer */}
      <ChatDrawer
        bookingId={booking.id}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        providerName={booking.provider?.business_name}
      />

      {/* Razorpay Test Mode Payment Modal */}
      <PaymentModal
        bookingId={booking.id}
        bookingCode={booking.booking_code}
        amount={booking.pricing.final_price || booking.pricing.estimated_price}
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentSuccess={() => {
          fetchBooking();
          setIsReviewOpen(true);
        }}
      />

      {/* Rating & Review Modal */}
      <ReviewModal
        bookingId={booking.id}
        providerName={booking.provider?.business_name}
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onSuccess={() => fetchBooking()}
      />

      {/* Cancellation Confirmation Dialog */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Cancel Roadside Assistance?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel incident <strong>{booking.booking_code}</strong>?
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500"
              >
                <option value="Vehicle started / resolved by driver">Vehicle engine started / issue resolved</option>
                <option value="Alternative arrangement made">Arranged another towing service</option>
                <option value="Waited too long">Driver taking too long</option>
                <option value="Booked by mistake">Booked by mistake</option>
              </select>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Keep Request Active
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

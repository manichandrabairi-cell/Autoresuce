import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, CheckCircle, Download, FileText, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface PaymentModalProps {
  bookingId: number;
  bookingCode: string;
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (invoiceNumber: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  bookingId,
  bookingCode,
  amount,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('driver@upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const subtotal = amount;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handlePay = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // 1. Create order
      const order = await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId }),
      });

      // 2. Simulate Razorpay verification callback
      const verifyRes = await apiRequest('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({
          booking_id: bookingId,
          razorpay_order_id: order.order_id,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: `sim_sig_${Date.now()}`
        }),
      });

      setInvoiceNumber(verifyRes.invoice_number);
      setPaymentDone(true);
      onPaymentSuccess(verifyRes.invoice_number);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-[#0f2744] text-white p-6 flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-orange-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                Razorpay Test Mode
              </span>
              <span className="text-xs text-slate-300">Ref: {bookingCode}</span>
            </div>
            <h3 className="text-xl font-bold mt-1">Digital Checkout & Settlement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentDone ? (
          /* Payment Success State */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">Payment Confirmed!</h4>
            <p className="text-sm text-slate-600">
              Your roadside assistance payment of <strong className="text-slate-900">{formatCurrency(total)}</strong> has been verified.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tax Invoice No:</span>
                <span className="font-mono font-bold text-slate-800">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18%):</span>
                <span className="text-slate-800">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200">
                <span>Total Settled:</span>
                <span className="text-emerald-700">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-2 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Checkout State */
          <div className="p-6 space-y-6">
            {/* Price breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Base Service & Towing:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST Tax (18%):</span>
                <span className="font-semibold text-slate-800">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-200 text-slate-900">
                <span>Total Amount Due:</span>
                <span className="text-orange-600 font-extrabold">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Payment method selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-center font-medium text-xs flex flex-col items-center space-y-1.5 transition ${
                    paymentMethod === 'UPI'
                      ? 'border-orange-500 bg-orange-50/70 text-orange-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-orange-500" />
                  <span>Instant UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-center font-medium text-xs flex flex-col items-center space-y-1.5 transition ${
                    paymentMethod === 'CARD'
                      ? 'border-orange-500 bg-orange-50/70 text-orange-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <span>Credit/Debit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-3 rounded-xl border text-center font-medium text-xs flex flex-col items-center space-y-1.5 transition ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-orange-500 bg-orange-50/70 text-orange-700 shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'UPI' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Virtual Payment Address (VPA) / UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center text-xs text-slate-500 space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>256-Bit SSL Encrypted. No raw card credentials stored.</span>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/25 transition text-base"
            >
              {isProcessing ? 'Verifying Transaction...' : `Pay Securely ${formatCurrency(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldAlert, User, Truck, Lock, Mail, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>(
    searchParams.get('role') === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mobile OTP Simulator modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('123456');
  const [otpVerified, setOtpVerified] = useState(false);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Open development phone verification simulator
    setShowOtpModal(true);
  };

  const verifyOtpAndRegister = async () => {
    setLoading(true);
    try {
      // 1. Verify OTP with simulated development endpoint
      await apiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp: otpValue })
      });

      setOtpVerified(true);
      setShowOtpModal(false);

      // 2. Perform registration
      const user = await register({
        email,
        password,
        full_name: fullName,
        phone,
        role,
        business_name: role === 'PROVIDER' ? businessName : undefined
      });

      if (user.role === 'PROVIDER') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setShowOtpModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0f2744] flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-6 h-6 text-orange-500" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#0f2744]">
            Auto<span className="text-orange-500">Rescue</span>
          </span>
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900">Create your AutoRescue account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-orange-600 hover:text-orange-500">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                role === 'CUSTOMER' ? 'bg-white text-[#0f2744] shadow' : 'text-slate-600'
              }`}
            >
              <User className="w-4 h-4 text-orange-500" />
              <span>Vehicle Owner</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                role === 'PROVIDER' ? 'bg-white text-[#0f2744] shadow' : 'text-slate-600'
              }`}
            >
              <Truck className="w-4 h-4 text-orange-500" />
              <span>Service Partner</span>
            </button>
          </div>

          <form onSubmit={handleInitialSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name
              </label>
              <input
                required
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {role === 'PROVIDER' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business / Fleeting Entity Name
                </label>
                <input
                  required
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Apex Roadside Logistics"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password (Min 6 Characters)
              </label>
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#0f2744] hover:bg-[#0a1b30] text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>Continue & Verify Mobile</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
          </form>
        </div>
      </div>

      {/* Development Mobile OTP Simulator Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-[#0f2744]">
              <Phone className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg">Development SMS OTP Simulator</h3>
            </div>
            <p className="text-xs text-slate-600">
              We dispatched an OTP simulation code to <strong>{phone}</strong>.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>Simulated OTP Code:</strong> <span className="font-mono font-bold">123456</span>
              <p className="mt-1 text-[11px] text-amber-700">Clearly labelled mock authentication for development testing.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-full text-center tracking-widest font-mono text-xl py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={verifyOtpAndRegister}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition"
              >
                {loading ? 'Creating...' : 'Verify & Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertCircle, User, Truck, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterLogin = (role: string) => {
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'PROVIDER') navigate('/provider/dashboard');
    else navigate('/customer/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);
      redirectAfterLogin(loggedUser.role);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    setError('');
    try {
      const loggedUser = await login(demoEmail, demoPass);
      redirectAfterLogin(loggedUser.role);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
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
        <h2 className="text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-500">
            register as a customer or service partner
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          {/* One-Click Demo Evaluator Buttons */}
          <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-4">
            <span className="block text-[11px] font-black uppercase tracking-wider text-orange-900 mb-2.5">
              Instant Demo Access (Click to autofill & login):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('customer@autorescue.com', 'Customer123!')}
                className="bg-white hover:bg-orange-100 text-slate-800 text-xs font-bold py-2 px-2 rounded-xl border border-orange-200 flex flex-col items-center shadow-xs transition"
              >
                <User className="w-4 h-4 text-orange-600 mb-1" />
                <span>Customer</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('provider@autorescue.com', 'Provider123!')}
                className="bg-white hover:bg-orange-100 text-slate-800 text-xs font-bold py-2 px-2 rounded-xl border border-orange-200 flex flex-col items-center shadow-xs transition"
              >
                <Truck className="w-4 h-4 text-orange-600 mb-1" />
                <span>Provider</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@autorescue.com', 'Admin123!')}
                className="bg-white hover:bg-orange-100 text-slate-800 text-xs font-bold py-2 px-2 rounded-xl border border-orange-200 flex flex-col items-center shadow-xs transition"
              >
                <Shield className="w-4 h-4 text-orange-600 mb-1" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@autorescue.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-orange-600 hover:text-orange-500 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2744] hover:bg-[#0a1b30] disabled:opacity-60 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center space-x-2 text-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

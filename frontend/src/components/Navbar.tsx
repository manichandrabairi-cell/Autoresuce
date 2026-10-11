import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldAlert, Menu, X, LogOut, ChevronDown, PhoneCall,
  LayoutDashboard, Truck, Settings, FileText, Activity, Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Fleet & Business', path: '/business' },
    { label: 'Help Desk', path: '/faq' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/customer/dashboard';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'PROVIDER') return '/provider/dashboard';
    return '/customer/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      {/* Top telemetry bar */}
      <div className="bg-slate-900/90 text-slate-300 text-[11px] py-1.5 px-4 hidden md:block border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-emerald-400 font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5"></span>
              24/7 AI Dispatch Active
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Urban corridor response SLA: ~14 mins</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">28 Cities Covered</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="tel:18001027372"
              className="flex items-center text-orange-400 hover:text-orange-300 font-bold tracking-wide transition"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-orange-500 animate-pulse" />
              National SOS Hotline: 1800-102-7372
            </a>
          </div>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center">
                Auto<span className="text-orange-500">Rescue</span>
              </span>
              <span className="text-[10px] tracking-widest font-semibold uppercase text-slate-400 -mt-1 flex items-center">
                AI Roadside Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'text-white bg-orange-500/90 shadow-sm font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={() => navigate('/customer/book')}
              className="relative group overflow-hidden bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/30 flex items-center space-x-2 text-xs sm:text-sm transition transform active:scale-95"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-ping mr-0.5"></div>
              <ShieldAlert className="w-4 h-4 text-white" />
              <span>Get Emergency SOS</span>
            </button>

            {/* Auth section */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-medium transition border border-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs font-bold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[100px] truncate text-slate-200">{user.full_name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-1.5 z-50 text-xs">
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Signed in as</p>
                      <p className="font-semibold text-white truncate mt-0.5">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2.5 text-orange-400" />
                      Dashboard
                    </Link>

                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link
                          to="/customer/bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                          <FileText className="w-4 h-4 mr-2.5 text-orange-400" />
                          My Bookings
                        </Link>
                        <Link
                          to="/customer/payments"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Truck className="w-4 h-4 mr-2.5 text-orange-400" />
                          Receipts & Invoices
                        </Link>
                      </>
                    )}

                    {user.role === 'PROVIDER' && (
                      <Link
                        to="/provider/jobs"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Truck className="w-4 h-4 mr-2.5 text-orange-400" />
                        Dispatches & Bids
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/providers"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        <Settings className="w-4 h-4 mr-2.5 text-orange-400" />
                        Provider Approvals
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-rose-400 hover:bg-rose-950/40 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 rounded-xl transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              type="button"
              onClick={() => navigate('/customer/book')}
              className="bg-orange-500 text-white font-bold p-2.5 rounded-xl shadow-md text-xs flex items-center"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 py-4 px-2 space-y-2 bg-slate-950 text-white">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t border-slate-800 pt-3 space-y-2">
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900"
                  >
                    Dashboard ({user.role})
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-slate-900"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold border border-slate-800 rounded-xl"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold bg-orange-500 text-white rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

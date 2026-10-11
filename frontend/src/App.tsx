import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

// Pages
import { Home } from '@/pages/Home';
import { Services } from '@/pages/Services';
import { ServiceDetail } from '@/pages/ServiceDetail';
import { HowItWorks } from '@/pages/HowItWorks';
import { Pricing } from '@/pages/Pricing';
import { BusinessSolutions } from '@/pages/BusinessSolutions';
import { FAQ } from '@/pages/FAQ';
import { Contact } from '@/pages/Contact';
import { Legal } from '@/pages/Legal';

// Auth Pages
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { ForgotPassword } from '@/pages/ForgotPassword';

// Customer Pages
import { CustomerDashboard } from '@/pages/CustomerDashboard';
import { BookingWizard } from '@/pages/BookingWizard';
import { CustomerBookings } from '@/pages/CustomerBookings';
import { LiveTracking } from '@/pages/LiveTracking';
import { CustomerPayments } from '@/pages/CustomerPayments';

// Provider Pages
import { ProviderDashboard } from '@/pages/ProviderDashboard';
import { ProviderVehicles } from '@/pages/ProviderVehicles';
import { ProviderDocuments } from '@/pages/ProviderDocuments';

// Admin Pages
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminProviders } from '@/pages/AdminProviders';
import { AdminCustomers } from '@/pages/AdminCustomers';
import { AdminBookings } from '@/pages/AdminBookings';

// Role Guard Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('CUSTOMER' | 'PROVIDER' | 'ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If provider tries to access customer or vice versa, redirect to own dashboard
    if (user.role === 'PROVIDER') return <Navigate to="/provider/dashboard" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:serviceSlug" element={<ServiceDetail />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/business" element={<BusinessSolutions />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Legal type="privacy" />} />
              <Route path="/terms" element={<Legal type="terms" />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Customer Protected Routes */}
              <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/book"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <BookingWizard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/bookings"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <CustomerBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/track/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
                    <LiveTracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/payments"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <CustomerPayments />
                  </ProtectedRoute>
                }
              />

              {/* Provider Protected Routes */}
              <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/jobs"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                    <ProviderVehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/provider/documents"
                element={
                  <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                    <ProviderDocuments />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/providers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminProviders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/customers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminCustomers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminBookings />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {/* Sticky Emergency Assistance Button on Mobile */}
          <div className="fixed bottom-3 inset-x-3 md:hidden z-40 pointer-events-auto">
            <Link
              to="/customer/book"
              className="flex items-center justify-between bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-red-950/60 border border-orange-400/40 active:scale-95 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center animate-pulse flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-amber-200">24/7 Breakdown SOS</div>
                  <div className="text-xs font-black leading-tight text-white">Emergency Roadside Dispatch</div>
                </div>
              </div>
              <div className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1">
                <span>Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;

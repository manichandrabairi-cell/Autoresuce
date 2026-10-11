import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Auto<span className="text-orange-500">Rescue</span>
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              AutoRescue is the next-generation AI-powered roadside marketplace connecting stranded vehicle owners with verified towing operators, wreckers, and mobile mechanics in real time.
            </p>
            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-500" />
                <span>24/7 National Emergency Dispatch: 1800-102-7372</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-500" />
                <span>support@autorescue.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Central Operations Tower, Tech Corridor, India</span>
              </div>
            </div>
          </div>

          {/* Roadside Services */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Roadside Services</h4>
            <ul className="space-y-2.5">
              <li><Link to="/services/flatbed-towing" className="hover:text-white transition">Flatbed Towing</Link></li>
              <li><Link to="/services/under-lift-towing" className="hover:text-white transition">Under-Lift Towing</Link></li>
              <li><Link to="/services/two-wheeler-towing" className="hover:text-white transition">Two-Wheeler Towing</Link></li>
              <li><Link to="/services/accident-recovery" className="hover:text-white transition">Accident Recovery</Link></li>
              <li><Link to="/services/battery-jump-start" className="hover:text-white transition">Battery Jump-Start</Link></li>
              <li><Link to="/services/flat-tyre-assistance" className="hover:text-white transition">Flat-Tyre Assistance</Link></li>
              <li><Link to="/services/ev-roadside-assistance" className="hover:text-white transition">EV Roadside Assistance</Link></li>
            </ul>
          </div>

          {/* Company & Partners */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Transparent Pricing</Link></li>
              <li><Link to="/business" className="hover:text-white transition">Fleet Solutions</Link></li>
              <li><Link to="/register?role=PROVIDER" className="text-orange-400 hover:text-orange-300 font-semibold transition">Become a Service Partner</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Support</Link></li>
              <li><Link to="/faq" className="hover:text-white transition">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">Trust & Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/terms#refund" className="hover:text-white transition">Refund & Cancellation</Link></li>
              <li><span className="text-xs text-slate-500 block">AI classification estimates do not replace on-site physical vehicle inspection.</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AutoRescue Technologies. All rights reserved.</p>
          <p className="mt-2 md:mt-0 flex items-center">
            Built with modern safety engineering for stranded motorists nationwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { Building, ShieldCheck, FileCheck, CheckCircle2, Send, Clock, Users, BarChart3, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export const BusinessSolutions: React.FC = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    contact_email: '',
    phone: '',
    fleet_size: 25,
    industry: 'Logistics & Supply Chain',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await apiRequest('/enterprise/lead', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
            Commercial Fleet Partnerships
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-3">
            Enterprise Roadside Assistance & Fleet SLA Recovery
          </h1>
          <p className="text-slate-600 mt-3 text-base">
            Custom dispatch portals, guaranteed arrival times, and monthly consolidated invoicing for logistics, rental networks, and insurers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Features Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <Clock className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold text-base text-slate-900">12-Min Priority Dispatch SLA</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Commercial trucks receive algorithmic priority in dispatch queue with guaranteed urban arrival windows.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <FileCheck className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold text-base text-slate-900">Consolidated GST Invoicing</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Eliminate individual driver reimbursements. Receive monthly consolidated tax invoices with detailed telematics.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <Users className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold text-base text-slate-900">Multi-User Control Center</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Equip fleet controllers, regional depot heads, and drivers with role-based incident reporting rights.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <BarChart3 className="w-8 h-8 text-orange-500 mb-3" />
                <h4 className="font-bold text-base text-slate-900">Breakdown Analytics</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Track recurring vehicle failure hotspots, tyre wear trends, and maintenance patterns across your vehicle fleet.
                </p>
              </div>
            </div>

            <div className="bg-[#0f2744] text-white p-6 rounded-3xl space-y-3">
              <h4 className="font-bold text-lg text-white">Who We Power:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-300">
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Long-Haul Logistics</span>
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Car Rental Companies</span>
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Motor Insurers</span>
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Dealership Chains</span>
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Corporate Cabs</span>
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" /> Last-Mile E-Commerce</span>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Connect With Enterprise Sales</h3>
              <p className="text-xs text-slate-600 mb-6">
                Receive customized volume quotes and an operational pilot demonstration within 2 hours.
              </p>

              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Inquiry Received</h4>
                  <p className="text-sm text-slate-600">
                    Thank you. Our dedicated Enterprise Logistics Lead will contact you shortly at <strong>{formData.contact_email}</strong>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Organization / Company Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      placeholder="e.g. Apex Logistics India Pvt Ltd"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Person
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        placeholder="Full Name"
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 00000"
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Official Work Email
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="fleetmanager@company.com"
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Fleet Size
                      </label>
                      <select
                        value={formData.fleet_size}
                        onChange={(e) => setFormData({ ...formData, fleet_size: Number(e.target.value) })}
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value={10}>5 - 20 Vehicles</option>
                        <option value={50}>21 - 100 Vehicles</option>
                        <option value={250}>100 - 500 Vehicles</option>
                        <option value={1000}>500+ Vehicles</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Industry
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="Logistics">Logistics / Freight</option>
                        <option value="Rental">Car Rental Fleet</option>
                        <option value="Dealership">Dealership Network</option>
                        <option value="Insurance">Insurance Carrier</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Requirements & Details
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Special requirements (e.g. EV chargers, heavy wreckers)..."
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Request Enterprise Quote'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

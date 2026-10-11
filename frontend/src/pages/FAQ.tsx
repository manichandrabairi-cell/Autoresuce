import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FAQ: React.FC = () => {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqItems = [
    {
      category: 'Booking & Dispatch',
      q: 'How does AutoRescue detect my breakdown location?',
      a: 'When you tap "Use Current Location", your browser or mobile device requests high-accuracy GPS coordinates. If GPS is unavailable, you can manually type any landmark, road junction, or highway mile marker.'
    },
    {
      category: 'Booking & Dispatch',
      q: 'Can I cancel my request if my car starts again?',
      a: 'Yes. You can cancel free of charge before a provider has departed (during SEARCHING or BIDDING phases). Once a provider is EN_ROUTE, a nominal minimum distance cancellation fee applies to compensate the dispatched driver for fuel and mobilization.'
    },
    {
      category: 'Pricing & Payments',
      q: 'Are online payments secure?',
      a: 'All transactions are processed through Razorpay test mode / bank gateways using 256-bit TLS encryption. We never store or inspect raw credit card numbers, CVVs, or bank credentials.'
    },
    {
      category: 'Pricing & Payments',
      q: 'Do I get an official tax invoice for business reimbursement?',
      a: 'Yes. Every completed rescue automatically generates a GST-compliant digital invoice with booking code, tax breakdown, and vehicle details available for instant download in your profile.'
    },
    {
      category: 'AI Diagnostics',
      q: 'What if the AI diagnosis is wrong about my vehicle damage?',
      a: 'The MobileNetV2 image scanner provides a preliminary recommendation to help you pick the right recovery category. You have full manual control to review, edit, or override the suggested service at step 5 of the booking wizard.'
    },
    {
      category: 'Safety & Trust',
      q: 'Are your towing trucks safe for low-chassis and EV cars?',
      a: 'Yes. Our verified network carries specialized hydraulic tilt flatbeds that maintain a low incline angle (< 8 degrees), specifically preventing front splitter scratches and battery pack scrapes on electric vehicles.'
    }
  ];

  const filtered = faqItems.filter(
    (item) => item.q.toLowerCase().includes(search.toLowerCase()) ||
              item.a.toLowerCase().includes(search.toLowerCase()) ||
              item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
            Help Center & Knowledge Base
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-3">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 mt-2 text-base">
            Everything you need to know about roadside dispatch, pricing, safety, and payments.
          </p>

          <div className="relative max-w-lg mx-auto mt-6">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roadside topics..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full text-left p-6 font-bold text-slate-900 flex justify-between items-center hover:bg-slate-50 transition"
              >
                <div>
                  <span className="text-[10px] text-orange-600 uppercase font-black tracking-widest block mb-1">
                    {item.category}
                  </span>
                  <span className="text-base text-slate-900">{item.q}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transform transition flex-shrink-0 ml-4 ${openIdx === idx ? 'rotate-180 text-orange-500' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-6 pb-6 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-14 bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <HelpCircle className="w-8 h-8 text-orange-500 mx-auto" />
          <h4 className="text-xl font-bold text-slate-900">Still Have Questions?</h4>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Our 24/7 central emergency operations dispatch desk is available by phone or email.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 bg-[#0f2744] hover:bg-[#0a1b30] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
            >
              <PhoneCall className="w-4 h-4 text-orange-400" />
              <span>Contact Support Desk</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

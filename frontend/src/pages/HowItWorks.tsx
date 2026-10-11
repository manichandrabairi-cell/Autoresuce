import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, Radio, CheckCircle2, ShieldCheck, MapPin, ArrowRight, Sparkles, Navigation } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      num: '01',
      title: 'Request Emergency Roadside Assistance',
      subtitle: 'Share your location and breakdown details',
      desc: 'Use one-tap GPS coordinate sharing or enter your address. Select your vehicle type, describe the issue, and upload a breakdown photo for instant AI damage classification.',
      icon: <Smartphone className="w-8 h-8 text-orange-500" />
    },
    {
      num: '02',
      title: 'Smart Dispatch & Provider Discovery',
      subtitle: 'PostGIS spatial radius matching within 15 km',
      desc: 'Our platform scans all verified, insured, and active recovery units nearby. In Auto Mode, the highest-rated nearest unit is assigned. In Bidding Mode, receive competitive offers and ETAs from competing drivers.',
      icon: <Radio className="w-8 h-8 text-orange-500" />
    },
    {
      num: '03',
      title: 'Real-Time GPS Tracking & Live Chat',
      subtitle: 'Watch your tow truck arrive on the map',
      desc: 'Follow the assigned recovery operator in real time. View driver photo, vehicle license plate, and live ETA countdown. Directly message or call the driver securely in-app.',
      icon: <Navigation className="w-8 h-8 text-orange-500" />
    },
    {
      num: '04',
      title: 'Transparent Settlement & Rating',
      subtitle: 'Secure payments with digital invoices',
      desc: 'Once the vehicle is safely recovered or serviced, pay via Razorpay (UPI, Card, Net Banking). Receive a GST tax invoice instantly and submit your provider rating.',
      icon: <CheckCircle2 className="w-8 h-8 text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
            Step-by-Step Guide
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 mt-3">
            How AutoRescue Delivers Peace of Mind
          </h1>
          <p className="text-slate-600 mt-3 text-base">
            Engineered for high-stress roadside emergencies with maximum transparency, speed, and safety.
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-orange-200 transition"
            >
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <span className="text-xs font-black text-orange-500 tracking-widest uppercase">Step {s.num}</span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{s.title}</h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">{s.subtitle}</p>
                  <p className="text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 bg-[#0f2744] rounded-3xl p-8 sm:p-12 text-white text-center space-y-4">
          <h3 className="text-3xl font-extrabold">Need Roadside Rescue Right Now?</h3>
          <p className="text-slate-300 max-w-xl mx-auto text-sm">
            Don't stay stranded on the shoulder. Trigger emergency dispatch or scan your vehicle breakdown in 30 seconds.
          </p>
          <div className="pt-2 flex justify-center space-x-4">
            <button
              onClick={() => navigate('/customer/book')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition flex items-center space-x-2 text-sm"
            >
              <span>Get Immediate Help</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

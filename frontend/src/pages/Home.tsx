import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert, Truck, Wrench, Zap, CircleDot, Fuel, BatteryCharging,
  Car, Shield, Clock, MapPin, CheckCircle2, ArrowRight, Star,
  Sparkles, ChevronRight, AlertTriangle, Users, Building, PhoneCall,
  Navigation, Radio, ShieldCheck, Gauge, Eye, Award
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ServiceCategory } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [quickLocation, setQuickLocation] = useState('Indiranagar 100ft Road, Bengaluru');
  const [quickVehicle, setQuickVehicle] = useState('Sedan');
  const [quickIssue, setQuickIssue] = useState('Flat tyre');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [serviceFilter, setServiceFilter] = useState<'ALL' | 'TOW' | 'QUICK' | 'SPECIAL'>('ALL');

  useEffect(() => {
    apiRequest<ServiceCategory[]>('/services')
      .then(setServices)
      .catch((err) => console.error('Failed to load services:', err));
  }, []);

  const stats = [
    { label: 'Verified Partners', value: '340+', desc: 'Licensed wreckers & flatbeds' },
    { label: 'Completed Rescues', value: '12,850+', desc: 'Stranded drivers recovered' },
    { label: 'Coverage Hubs', value: '28 Cities', desc: 'National expressways active' },
    { label: 'Urban Response SLA', value: '14.5 mins', desc: 'Average tow truck arrival' },
  ];

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Truck': return <Truck className="w-6 h-6 text-orange-500" />;
      case 'Car': return <Car className="w-6 h-6 text-orange-500" />;
      case 'Zap': return <Zap className="w-6 h-6 text-orange-500" />;
      case 'CircleDot': return <CircleDot className="w-6 h-6 text-orange-500" />;
      case 'Fuel': return <Fuel className="w-6 h-6 text-orange-500" />;
      case 'BatteryCharging': return <BatteryCharging className="w-6 h-6 text-orange-500" />;
      case 'AlertTriangle': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      default: return <Wrench className="w-6 h-6 text-orange-500" />;
    }
  };

  const filteredServices = services.filter((s) => {
    if (serviceFilter === 'TOW') return s.slug.includes('towing') || s.slug.includes('recovery');
    if (serviceFilter === 'QUICK') return s.slug.includes('jump') || s.slug.includes('tyre') || s.slug.includes('fuel');
    if (serviceFilter === 'SPECIAL') return s.slug.includes('ev') || s.slug.includes('heavy') || s.slug.includes('accident');
    return true;
  });

  const faqs = [
    {
      q: 'How quickly does an AutoRescue tow truck arrive at my location?',
      a: 'Our smart dispatch algorithm locates the nearest verified tow truck or recovery van based on real-time GPS telemetry. Across urban metro zones and highway corridors, our average arrival time is 14.5 minutes.'
    },
    {
      q: 'Are AutoRescue prices fixed or will the driver charge extra on-site?',
      a: 'We guarantee 100% transparent upfront pricing calculated by standard base dispatch fees and exact GPS distance. You review and approve the verified estimate before dispatch, eliminating roadside bargaining.'
    },
    {
      q: 'How does the AI breakdown image scanner assist me?',
      a: 'When you take a photo of your breakdown (e.g. flat tyre, collision damage, smoking radiator), our MobileNetV2 computer vision model analyzes visual patterns and automatically recommends the appropriate towing apparatus (hydraulic flatbed vs wheel-lift). Note: Visual estimates do not replace on-site physical inspection.'
    },
    {
      q: 'How are AutoRescue service providers vetted and verified?',
      a: 'Every provider undergoes thorough compliance validation: commercial carrier permits, driver licenses, vehicle fitness certificates, and insurance validation approved by our administrative compliance team.'
    },
    {
      q: 'Can I choose between instant auto-dispatch and competitive bidding?',
      a: 'Yes! For immediate urgency, Auto-Dispatch matches the closest top-rated tow truck. For scheduled or non-emergency hauls, Competitive Bidding lets multiple nearby operators quote their price and ETA so you choose the best offer.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-[#0b132b] text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        {/* Futuristic background grid & light glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-slate-900/90 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-orange-400 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                <span className="font-bold">Next-Gen Roadside Telemetry</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Live GPS Radar & MobileNetV2 Vision</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Stranded on the Road? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-500">
                  Help Is on the Way.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Book verified towing and emergency roadside assistance in seconds. Compare competitive quotes, scan breakdown faults with AI, and track your tow truck in real time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/customer/book')}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-7 py-4 rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center space-x-2 text-base transition transform hover:-translate-y-0.5 active:scale-95"
                >
                  <ShieldAlert className="w-5 h-5 text-white" />
                  <span>Get Roadside Assistance</span>
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </button>

                <Link
                  to="/register?role=PROVIDER"
                  className="bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 font-bold px-6 py-4 rounded-2xl flex items-center justify-center space-x-2 text-base transition"
                >
                  <Truck className="w-5 h-5 text-orange-400" />
                  <span>Become a Service Partner</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold">100% Vetted Fleets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold">Zero Surge Surprises</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold">Live GPS Telemetry</span>
                </div>
              </div>
            </div>

            {/* Right Column: Emergency Assistance Launcher Widget */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-white space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
                    <span className="font-extrabold text-xs text-rose-400 uppercase tracking-wider">
                      Emergency Dispatch Console
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Radar Online
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Current Location Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Breakdown Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-orange-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={quickLocation}
                        onChange={(e) => setQuickLocation(e.target.value)}
                        placeholder="Enter landmark, road, or milestone..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Vehicle Type Pills */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Vehicle Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Hatchback', 'Sedan', 'SUV', 'Motorcycle', 'Commercial'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setQuickVehicle(v)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold transition border ${
                            quickVehicle === v
                              ? 'bg-orange-500 text-white border-orange-400 shadow-sm'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Issue Quick Tag */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Reported Issue
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Flat tyre', 'Battery dead', 'Engine failure', 'Accident recovery'].map((iss) => (
                        <button
                          key={iss}
                          type="button"
                          onClick={() => setQuickIssue(iss)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-left transition border ${
                            quickIssue === iss
                              ? 'bg-slate-800 text-orange-400 border-orange-500/50'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60'
                          }`}
                        >
                          {iss}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch CTA */}
                  <button
                    type="button"
                    onClick={() => navigate(`/customer/book?location=${encodeURIComponent(quickLocation)}&vehicle=${encodeURIComponent(quickVehicle)}&problem=${encodeURIComponent(quickIssue)}`)}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-orange-500/30 transition flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>Instant Request & AI Scan</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STATISTICS */}
      <section className="bg-slate-950 border-b border-slate-800 py-10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="p-4 border-r last:border-r-0 border-slate-800/80">
                <span className="block text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-orange-400">
                  {s.value}
                </span>
                <span className="block text-sm font-bold text-slate-200 mt-1">{s.label}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-orange-600 font-extrabold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
              Full Spectrum Fleet Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Professional Roadside & Towing Solutions
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Certified commercial equipment, licensed recovery operators, and guaranteed transparent pricing across all vehicle classes.
            </p>

            {/* Category Filter Pills */}
            <div className="flex justify-center space-x-2 mt-6 overflow-x-auto no-scrollbar">
              {(['ALL', 'TOW', 'QUICK', 'SPECIAL'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setServiceFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    serviceFilter === tab
                      ? 'bg-[#0f2744] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab === 'ALL' ? 'All Services (10)' : tab === 'TOW' ? 'Towing & Recovery' : tab === 'QUICK' ? 'Roadside Assist' : 'EV & Heavy'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition duration-300">
                      {getServiceIcon(svc.icon)}
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      ~{svc.turnaround_mins} mins
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition">
                    {svc.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Base Fare</span>
                      <span className="text-xl font-black text-slate-900">{formatCurrency(svc.base_price)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Per KM</span>
                      <span className="text-xs font-bold text-slate-700">{formatCurrency(svc.per_km_rate)} / km</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/services/${svc.slug}`}
                      className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl text-center transition"
                    >
                      Learn More
                    </Link>
                    <button
                      type="button"
                      onClick={() => navigate(`/customer/book?serviceId=${svc.id}`)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl text-center transition shadow-sm"
                    >
                      Book Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW AI HELPS SECTION */}
      <section className="py-20 bg-slate-950 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-orange-400 font-extrabold uppercase tracking-wider text-xs bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-full">
                AI Computer Vision Diagnostics
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                MobileNetV2 Visual Breakdown Assessment
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                Unsure if your car requires a flatbed, a wheel-lift, or a simple tyre pump? Take a quick photograph of the fault.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start space-x-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <Eye className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Visual Anomaly Recognition</strong>
                    Detects wheel deformation, radiator steam/smoke signatures, impact bodywork, and battery cable corrosion.
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <Gauge className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Apparatus Optimization</strong>
                    Recommends correct towing capacity (low-incline flatbed for AWD/EV, ramp carriers for bikes).
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200">
                <strong className="block text-amber-300 font-bold mb-0.5">Automated Estimate Disclaimer:</strong>
                A photograph cannot definitively diagnose internal mechanical or electrical faults; an on-site technician inspection is required.
              </div>
            </div>

            {/* AI Scanner Simulation Screen */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span className="font-mono text-xs font-bold text-white">MobileNetV2 Tensor Output</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                    Confidence: 91.4%
                  </span>
                </div>

                <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-3">
                  <div className="text-slate-500 text-[11px]">&#47;&#47; Real-time inference structured telemetry</div>
                  <pre className="text-emerald-400 text-xs overflow-x-auto leading-relaxed">
{`{
  "predicted_category": "tyre_damage",
  "label": "Tyre or Wheel Damage",
  "confidence": 0.91,
  "severity": "moderate",
  "recommended_service": "Flat-Tyre Assistance",
  "requires_manual_review": false,
  "model_version": "MobileNetV2-AutoRescue-v1.4.0"
}`}
                  </pre>
                  <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400 font-sans">
                    <span>Target: 224x224 RGB Tensor</span>
                    <span>Inference Latency: 38ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
              Engineered For Safety
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              How AutoRescue Recovers You Safely
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Request Assistance',
                desc: 'Share current GPS coordinates, vehicle category, and upload a breakdown photo for instant AI damage scanning.'
              },
              {
                step: '02',
                title: 'Smart Matching',
                desc: 'Match with the nearest certified recovery unit in Auto Mode, or open competitive bids from top-rated fleets.'
              },
              {
                step: '03',
                title: 'Confirm Service',
                desc: 'Review upfront calculated costs, driver ratings, and equipment specifications before dispatching.'
              },
              {
                step: '04',
                title: 'Track, Pay & Rate',
                desc: 'Follow your tow truck live on an interactive map, settle digitally via Razorpay, and rate your operator.'
              }
            ].map((s, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 relative group hover:border-orange-300 transition">
                <span className="text-3xl font-black text-orange-500 block mb-2">{s.step}</span>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER REVIEWS */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
              Driver Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              Trusted When It Matters Most
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Arjun Sharma',
                city: 'Bengaluru',
                service: 'Flat-Tyre Assistance',
                rating: 5,
                text: 'Stranded with a flat tyre on the expressway at 11 PM. AutoRescue dispatched a flatbed in 12 minutes with full GPS tracking!'
              },
              {
                name: 'Priya Patel',
                city: 'Mumbai',
                service: 'Flatbed Towing',
                rating: 5,
                text: 'The AI breakdown scan accurately recommended flatbed towing when my luxury sedan had lower arm damage. Incredible service.'
              },
              {
                name: 'Vikram Malhotra',
                city: 'Delhi NCR',
                service: 'Battery Jump-Start',
                rating: 5,
                text: 'Clear upfront pricing and live map tracking made the whole emergency completely stress-free. No haggling on the roadside.'
              }
            ].map((r, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex space-x-1 text-amber-400 mb-3">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    "{r.text}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">{r.name}</h5>
                    <span className="text-xs text-slate-500">{r.city}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                    {r.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs bg-orange-100 px-3 py-1 rounded-full">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left p-5 font-bold text-slate-900 flex justify-between items-center hover:bg-slate-50 transition"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-slate-400 transform transition flex-shrink-0 ml-4 ${activeFaq === idx ? 'rotate-90 text-orange-500' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENTERPRISE CALLOUT BANNER */}
      <section className="bg-slate-950 text-white py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-orange-400 font-bold uppercase tracking-wider text-xs">For Commercial Fleets & Insurers</span>
            <h3 className="text-2xl sm:text-3xl font-bold mt-1">Manage 50+ Vehicles With Priority Dispatch SLAs</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Consolidated enterprise invoicing, dedicated fleet managers, and guaranteed 12-minute response times for logistics and corporate fleets.
            </p>
          </div>
          <Link
            to="/business"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition whitespace-nowrap text-sm"
          >
            Explore Fleet Solutions
          </Link>
        </div>
      </section>
    </div>
  );
};

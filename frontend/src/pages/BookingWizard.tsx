import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Car, AlertTriangle, Upload, MapPin, Truck, Calculator, CheckCircle2,
  ArrowRight, ArrowLeft, Sparkles, Navigation, X, ShieldAlert, Radio, Clock,
  Battery, Wrench, Shield, Check, Eye
} from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { ServiceCategory, AIClassificationResult } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [services, setServices] = useState<ServiceCategory[]>([]);

  // Form State
  // Step 1: Vehicle Details
  const [vehicleType, setVehicleType] = useState<string>(searchParams.get('vehicle') || 'Sedan');
  const [vehicleBrand, setVehicleBrand] = useState<string>('Honda');
  const [vehicleModel, setVehicleModel] = useState<string>('City ZX');
  const [vehiclePlate, setVehiclePlate] = useState<string>('KA-03-HA-8120');
  const [fuelType, setFuelType] = useState<string>('Petrol');
  const [vehicleCondition, setVehicleCondition] = useState<string>('Stationary / Immobile');

  // Step 2: Problem Details
  const [problemType, setProblemType] = useState<string>(searchParams.get('problem') || 'Flat tyre');
  const [problemDescription, setProblemDescription] = useState<string>('Tyre punctured on highway shoulder. Wheel immobile.');

  // Step 3: Photos & AI Classification
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [aiResult, setAiResult] = useState<AIClassificationResult | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);

  // Step 4: Location
  const [pickupAddress, setPickupAddress] = useState<string>(
    searchParams.get('location') || 'Indiranagar 100ft Road, Bengaluru'
  );
  const [pickupLat, setPickupLat] = useState<number>(12.9716);
  const [pickupLng, setPickupLng] = useState<number>(77.5946);
  const [destinationAddress, setDestinationAddress] = useState<string>('Authorized Brand Workshop, Whitefield');
  const [destinationLat] = useState<number>(12.9856);
  const [destinationLng] = useState<number>(77.7289);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Step 5: Service & Dispatch Mode
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    Number(searchParams.get('serviceId')) || 1
  );
  const [dispatchMode, setDispatchMode] = useState<'AUTO' | 'BIDDING'>('AUTO');

  // Step 6: Pricing Estimate
  const [estimate, setEstimate] = useState<any>(null);
  const [estimating, setEstimating] = useState<boolean>(false);

  // Step 7: Confirmation & Submission
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    apiRequest<ServiceCategory[]>('/services')
      .then((data) => {
        setServices(data);
        if (data.length > 0 && !searchParams.get('serviceId')) {
          setSelectedServiceId(data[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Use browser geolocation
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPickupLat(pos.coords.latitude);
          setPickupLng(pos.coords.longitude);
          setPickupAddress(`GPS Point (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsLocating(false);
        },
        () => {
          setPickupLat(12.9716);
          setPickupLng(77.5946);
          setPickupAddress('MG Road Metro Station, Bengaluru');
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  // Upload photo & run MobileNetV2 classification
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setAiAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiRequest<AIClassificationResult>('/ai/classify-breakdown', {
        method: 'POST',
        body: formData,
      });
      setAiResult(res);

      // Auto-recommend service if matching
      const matched = services.find((s) =>
        s.name.toLowerCase().includes(res.recommended_service.toLowerCase().split(' ')[0])
      );
      if (matched) {
        setSelectedServiceId(matched.id);
      }
    } catch (err) {
      console.error('AI Inference failed:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Fetch price estimate when entering step 6
  const fetchPriceEstimate = async () => {
    setEstimating(true);
    try {
      const est = await apiRequest('/bookings/estimate', {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedServiceId,
          vehicle_type: vehicleType,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          destination_lat: destinationLat,
          destination_lng: destinationLng,
        }),
      });
      setEstimate(est);
    } catch (err) {
      console.error(err);
    } finally {
      setEstimating(false);
    }
  };

  const handleNextStep = () => {
    if (step === 5) {
      fetchPriceEstimate();
    }
    setStep((prev) => Math.min(prev + 1, 7));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Final confirmation
  const handleConfirmBooking = async () => {
    if (!user) {
      navigate('/login?redirect=/customer/book');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedServiceId,
          vehicle_type: vehicleType,
          vehicle_brand: vehicleBrand,
          vehicle_model: vehicleModel,
          vehicle_plate: vehiclePlate,
          fuel_type: fuelType,
          vehicle_condition: vehicleCondition,
          problem_type: problemType,
          problem_description: problemDescription,
          pickup_address: pickupAddress,
          pickup_lat: pickupLat,
          pickup_lng: pickupLng,
          destination_address: destinationAddress,
          destination_lat: destinationLat,
          destination_lng: destinationLng,
          dispatch_mode: dispatchMode,
          photo_urls: aiResult ? [aiResult.image_url] : [],
          ai_predicted_label: aiResult?.predicted_category,
          ai_confidence: aiResult?.confidence,
        }),
      });

      // Redirect immediately to live tracking radar
      navigate(`/customer/track/${res.id}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to dispatch booking. Please try again.');
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const vehicleTiers = [
    { type: 'Motorcycle', label: 'Two-Wheeler', sub: 'Motorcycle / Scooter', icon: '🏍️' },
    { type: 'Hatchback', label: 'Hatchback', sub: 'Swift, i20, Polo', icon: '🚗' },
    { type: 'Sedan', label: 'Sedan', sub: 'City, Verna, Ciaz', icon: '🚘' },
    { type: 'SUV', label: 'SUV / MUV', sub: 'Creta, Fortuner, XUV', icon: '🚙' },
    { type: 'Commercial vehicle', label: 'Commercial', sub: 'Tempo, Van, Pickup', icon: '🚐' },
    { type: 'Bus or heavy vehicle', label: 'Heavy Truck', sub: 'Multi-axle, Bus', icon: '🚛' },
  ];

  const commonProblems = [
    { label: 'Flat tyre', sub: 'Puncture / shredded tyre', icon: '🛞' },
    { label: 'Battery failure', sub: 'No crank / dead battery', icon: '⚡' },
    { label: 'Engine failure', sub: 'Stalled / odd noise', icon: '🔧' },
    { label: 'Accident', sub: 'Collision / impact damage', icon: '⚠️' },
    { label: 'Overheating', sub: 'Radiator steam / temp high', icon: '🌡️' },
    { label: 'Transmission issue', sub: 'Gear locked / clutch fault', icon: '⚙️' },
    { label: 'Fuel problem', sub: 'Out of fuel / wrong fuel', icon: '⛽' },
    { label: 'Vehicle stuck', sub: 'Ditch / mud / sand extraction', icon: '🪝' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            <span>Emergency Roadside Dispatch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Book Roadside Assistance
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Step {step} of 7: {
              step === 1 ? 'Select Vehicle Class' :
              step === 2 ? 'Report Incident Issue' :
              step === 3 ? 'AI Breakdown Scan' :
              step === 4 ? 'Location Coordinates' :
              step === 5 ? 'Choose Service & Mode' :
              step === 6 ? 'Upfront Fare Breakdown' :
              'Review & Trigger Dispatch'
            }
          </p>
        </div>

        {/* Modern Stepper */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs mb-8 flex justify-between items-center overflow-x-auto no-scrollbar">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div key={num} className="flex items-center space-x-1.5 px-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                  step === num
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-100'
                    : step > num
                    ? 'bg-[#0f2744] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > num ? <Check className="w-4 h-4" /> : num}
              </div>
              <span className={`text-[11px] font-bold whitespace-nowrap hidden sm:inline ${
                step === num ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {num === 1 ? 'Vehicle' : num === 2 ? 'Problem' : num === 3 ? 'AI Scan' : num === 4 ? 'Location' : num === 5 ? 'Service' : num === 6 ? 'Estimate' : 'Confirm'}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8">

          {/* STEP 1: VEHICLE DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Step 1: Your Vehicle Information</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select vehicle class to allocate compatible towing equipment.</p>
              </div>

              {/* Visual Vehicle Class Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vehicleTiers.map((vt) => (
                  <button
                    type="button"
                    key={vt.type}
                    onClick={() => setVehicleType(vt.type)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      vehicleType === vt.type
                        ? 'border-orange-500 bg-orange-50/80 shadow-sm ring-2 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{vt.icon}</span>
                    <strong className="text-xs font-bold text-slate-900 block">{vt.label}</strong>
                    <span className="text-[10px] text-slate-500 block truncate">{vt.sub}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vehicle Brand & Make
                  </label>
                  <input
                    type="text"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="e.g. Honda, Hyundai, Tata"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Model
                  </label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. City ZX, Creta SX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Registration Plate Number
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="KA-03-HA-8120"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm uppercase font-mono font-bold tracking-wider focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Powertrain / Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric (EV)">Electric (EV)</option>
                    <option value="CNG / Hybrid">CNG / Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROBLEM DETAILS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Step 2: What Happened to Your Vehicle?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the primary issue to allocate appropriate recovery mechanics.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {commonProblems.map((prob) => (
                  <button
                    type="button"
                    key={prob.label}
                    onClick={() => setProblemType(prob.label)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      problemType === prob.label
                        ? 'border-orange-500 bg-orange-50/80 shadow-sm ring-2 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl block mb-1">{prob.icon}</span>
                    <strong className="text-xs font-bold text-slate-900 block">{prob.label}</strong>
                    <span className="text-[10px] text-slate-500 block truncate">{prob.sub}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Notes For Tow Operator (Optional)
                </label>
                <textarea
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe warning indicators, sounds, highway mile marker, or physical road obstacles..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PHOTO UPLOAD & AI CLASSIFICATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <Sparkles className="w-5 h-5 text-orange-500 mr-2" />
                    Step 3: AI Breakdown Vision Diagnostics
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a photo of your tyre, bonnet, or collision. MobileNetV2 will automatically analyze damage patterns.
                  </p>
                </div>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  MobileNetV2 Vision
                </span>
              </div>

              {!photoPreview ? (
                <label className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/20 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition text-center space-y-3">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">Click to upload breakdown photo</span>
                    <span className="text-xs text-slate-400">Supports JPG, PNG, WEBP from your phone camera</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-black flex items-center justify-center">
                    <img src={photoPreview} alt="Breakdown Preview" className="object-contain max-h-72 w-full" />
                    
                    {/* Animated scanning laser effect while analyzing */}
                    {aiAnalyzing && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_15px_#f97316] animate-scan-line"></div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview('');
                        setAiResult(null);
                      }}
                      className="absolute top-3 right-3 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full shadow-md transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AI Results Output */}
                  {aiAnalyzing ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center space-x-3 text-orange-800 text-xs sm:text-sm">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                      <span className="font-semibold">Extracting image features with MobileNetV2 neural vision...</span>
                    </div>
                  ) : aiResult ? (
                    <div className="p-5 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-orange-400" />
                          <span className="font-bold text-sm text-orange-400">{aiResult.label}</span>
                        </div>
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                          {(aiResult.confidence * 100).toFixed(0)}% Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                        <div>
                          <span className="text-slate-400 block">Severity Level:</span>
                          <span className="capitalize font-bold text-amber-400">{aiResult.severity}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Suggested Service:</span>
                          <span className="font-bold text-emerald-400">{aiResult.recommended_service}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-800">
                        * {aiResult.disclaimer}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: LOCATION COORDINATES */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <MapPin className="w-5 h-5 text-orange-500 mr-2" />
                  Step 4: Breakdown Location & Workshop Drop-Off
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Accurate location ensures nearest recovery units are dispatched.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Breakdown Location Address
                    </label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center space-x-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isLocating ? 'Detecting GPS...' : 'Use Current GPS'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Enter street, landmark, or highway mile marker"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Target Coords: {pickupLat.toFixed(4)}, {pickupLng.toFixed(4)}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Destination Drop-Off / Workshop (Optional for Towing)
                  </label>
                  <input
                    type="text"
                    value={destinationAddress}
                    onChange={(e) => setDestinationAddress(e.target.value)}
                    placeholder="Authorized Brand Workshop, Garage, or Home Address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SERVICE & DISPATCH MODE */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Truck className="w-5 h-5 text-orange-500 mr-2" />
                  Step 5: Select Assistance Service & Dispatch Mode
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Choose your desired recovery operation and dispatch strategy.</p>
              </div>

              {/* Services List */}
              <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                {services.map((svc) => (
                  <button
                    type="button"
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition ${
                      selectedServiceId === svc.id
                        ? 'border-orange-500 bg-orange-50/80 shadow-xs ring-2 ring-orange-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{svc.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{svc.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="font-extrabold text-sm text-[#0f2744] block">{formatCurrency(svc.base_price)}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        ~{svc.turnaround_mins}m ETA
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mode A vs Mode B */}
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Dispatch Mode Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDispatchMode('AUTO')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      dispatchMode === 'AUTO'
                        ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-200 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Radio className="w-4 h-4 text-orange-500" />
                      <strong className="text-xs sm:text-sm text-slate-900">Mode A: Instant Auto-Dispatch (Recommended)</strong>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Assigns the closest verified operator immediately based on proximity and live telemetry. Fastest for highway emergencies.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDispatchMode('BIDDING')}
                    className={`p-4 rounded-2xl border text-left transition ${
                      dispatchMode === 'BIDDING'
                        ? 'border-orange-500 bg-orange-50/80 ring-2 ring-orange-200 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <strong className="text-xs sm:text-sm text-slate-900">Mode B: Competitive Bidding</strong>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Opens a 15-minute window for multiple regional operators to submit competing price quotes and ETAs.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PRICING ESTIMATE */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <Calculator className="w-5 h-5 text-orange-500 mr-2" />
                  Step 6: Verified Upfront Price Estimate
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Calculated by official rate formula and route distance.</p>
              </div>

              {estimating ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  Calculating telemetry route and mileage fee...
                </div>
              ) : estimate ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Service Fee ({selectedService?.name}):</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(estimate.base_fee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Route Distance ({estimate.distance_km} KM):</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(estimate.distance_charge)}</span>
                    </div>
                    {estimate.vehicle_surcharge > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Vehicle Class Surcharge ({vehicleType}):</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(estimate.vehicle_surcharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-200 text-slate-900">
                      <span>Estimated Total Fare:</span>
                      <span className="text-orange-600 font-extrabold text-xl">{formatCurrency(estimate.estimated_total)}</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Estimated Arrival Time: ~{estimate.estimated_eta_mins} minutes across active urban corridor.</span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    * {estimate.disclaimer}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 7: CONFIRM BOOKING */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
                  Step 7: Final Dispatch Confirmation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Verify your details before broadcasting the emergency dispatch.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
                    <span className="font-bold text-slate-800">{vehicleBrand} {vehicleModel}</span>
                    <span className="text-xs font-mono text-slate-500 block">{vehiclePlate} • {vehicleType}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Requested Service</span>
                    <span className="font-bold text-slate-800">{selectedService?.name}</span>
                    <span className="text-xs text-slate-500 block">{problemType}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Breakdown Location</span>
                  <span className="text-slate-800 font-medium">{pickupAddress}</span>
                </div>

                {destinationAddress && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Drop-Off Workshop</span>
                    <span className="text-slate-800 font-medium">{destinationAddress}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Dispatch Mode</span>
                    <span className="text-xs font-bold text-orange-600">
                      {dispatchMode === 'AUTO' ? 'Instant Auto-Dispatch' : 'Competitive Bidding Window'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Upfront Estimate</span>
                    <span className="text-2xl font-black text-[#0f2744]">
                      {formatCurrency(estimate?.estimated_total || selectedService?.base_price || 799)}
                    </span>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* Navigation Stepper Controls */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 flex items-center space-x-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div></div>}

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 bg-[#0f2744] hover:bg-[#0a1b30] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 shadow-md transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmBooking}
                className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 text-white rounded-xl text-sm sm:text-base font-extrabold flex items-center space-x-2 shadow-xl shadow-orange-500/30 transition animate-pulse"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>{submitting ? 'Dispatching Rescue Unit...' : 'Broadcast Emergency Dispatch'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

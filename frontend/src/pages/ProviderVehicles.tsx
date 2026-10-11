import React, { useState, useEffect } from 'react';
import { Truck, Plus, CheckCircle, ShieldCheck } from 'lucide-react';
import { apiRequest } from '@/lib/api';

export const ProviderVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: 'Hydraulic Flatbed Carrier',
    make_model: 'Tata 709g HD Flatbed',
    license_plate: 'KA-01-MJ-9921',
    year: 2023,
    capacity_tons: 4.5
  });

  const fetchVehicles = async () => {
    try {
      const data = await apiRequest('/providers/vehicles');
      setVehicles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/providers/vehicles', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowAddModal(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Failed to add vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Fleet Registry</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Registered Towing Equipment</h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#0f2744] hover:bg-[#0a1b30] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-orange-400" />
            <span>Register New Vehicle</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Verified
                </span>
              </div>

              <div>
                <h4 className="font-bold text-lg text-slate-900">{v.make_model}</h4>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">{v.license_plate}</span>
                <p className="text-xs text-slate-600 mt-2">{v.vehicle_type}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between text-slate-600">
                <span>Gross Capacity:</span>
                <span className="font-bold text-slate-800">{v.capacity_tons} Tons</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Add Tow Truck To Fleet</h3>
            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Make & Model</label>
                <input
                  required
                  type="text"
                  value={formData.make_model}
                  onChange={(e) => setFormData({ ...formData, make_model: e.target.value })}
                  placeholder="Tata 709g HD Flatbed"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">License Plate</label>
                <input
                  required
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  placeholder="KA-01-AB-1234"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Apparatus</label>
                <select
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                >
                  <option value="Hydraulic Flatbed Carrier">Hydraulic Flatbed Carrier</option>
                  <option value="Wheel-Lift Wrecker">Wheel-Lift Wrecker</option>
                  <option value="Two-Wheeler Carrier">Two-Wheeler Ramp Carrier</option>
                  <option value="Heavy Commercial Wrecker">Heavy Commercial Wrecker</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

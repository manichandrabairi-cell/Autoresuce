import React from 'react';

export const Legal: React.FC<{ type: 'privacy' | 'terms' }> = ({ type }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        {type === 'privacy' ? (
          <>
            <h1 className="text-3xl font-extrabold text-slate-900">Privacy & Data Governance Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: October 2026</p>

            <h3 className="text-lg font-bold text-slate-900 mt-4">1. Information Collection</h3>
            <p>
              AutoRescue gathers telemetry necessary to complete emergency roadside extraction, including precise GPS coordinates, contact phone numbers, breakdown photographs, and vehicle registration attributes.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-4">2. Location Data Handling</h3>
            <p>
              GPS coordinates are shared strictly with the assigned verified service operator during an active incident dispatch. Provider locations are transmitted to customers for active safety verification. Location sharing expires once service is terminated or completed.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-4">3. AI Computer Vision Diagnostic Logs</h3>
            <p>
              Vehicle breakdown photographs uploaded for MobileNetV2 assessment are stripped of extraneous EXIF metadata and stored securely. Visual diagnostic estimates do not constitute official insurance damage claims.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service & Cancellation Policy</h1>
            <p className="text-xs text-slate-400">Effective Date: October 2026</p>

            <h3 className="text-lg font-bold text-slate-900 mt-4">1. Roadside Dispatch Platform Role</h3>
            <p>
              AutoRescue acts as a digital dispatch marketplace pairing vehicle motorists with licensed independent commercial recovery providers. All participating tow truck operators undergo document vetting before production deployment.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-4" id="refund">2. Cancellation & Refund Policy</h3>
            <p>
              Customers may cancel a dispatch request free of charge while in SEARCHING or BIDDING status. Once a provider has departed and is marked EN_ROUTE, a nominal minimum mobilization fee applies to cover operator fuel. If a provider fails to reach the scene within acceptable tolerances, full refunds are credited immediately.
            </p>

            <h3 className="text-lg font-bold text-slate-900 mt-4">3. Payment & Settlement</h3>
            <p>
              All customer settlements must be made via verified digital channels (Razorpay test mode gateway, UPI, or corporate account). Direct cash surcharges outside the generated digital invoice are prohibited.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Clock, Upload, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export const ProviderDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>('/providers/documents')
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <span className="text-orange-600 font-bold uppercase tracking-wider text-xs">Compliance & Vetting</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Verification Documents</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            AutoRescue requires validated state commercial transport permits, fitness certificates, and insurance.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No documents uploaded yet.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-orange-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{doc.document_type.replace(/_/g, ' ')}</h4>
                      <span className="text-xs text-slate-400">Uploaded on {formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>

                  <div>
                    {doc.status === 'APPROVED' ? (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Verified & Approved
                      </span>
                    ) : doc.status === 'PENDING' ? (
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        Pending Admin Review
                      </span>
                    ) : (
                      <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-bold">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

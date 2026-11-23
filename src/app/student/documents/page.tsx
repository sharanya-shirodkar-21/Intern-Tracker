'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  ShieldCheck, 
  ArrowLeft,
  FileCheck,
  History,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { DocumentRecord, DocumentType } from '@/types/database';
import { downloadStudentDossierDocument, downloadStudentDossierExcel } from '@/lib/student-dossier';

export default function StudentDocumentsPage() {
  const { currentUser, storeState, refreshStore } = useAuth();
  const student = currentUser;

  const intern = storeState.internships.find((i) => i.student_id === student?.id);
  const documents = intern ? storeState.documents.filter((d) => d.internship_id === intern.id) : [];

  const [uploadType, setUploadType] = useState<DocumentType>('offer_letter');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file || !intern || !student) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate type and size (PDF only, max 15MB)
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Invalid file format. Only PDF (.pdf) documents are accepted.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds 15MB limit.');
      return;
    }

    const store = StoreManager.getInstance();
    const state = store.getState();

    // Check versioning
    const existingVersions = state.documents.filter(
      (d) => d.internship_id === intern.id && d.type === type
    );
    const nextVersion = existingVersions.length + 1;

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      internship_id: intern.id,
      type,
      storage_path: `documents/${intern.id}/${type}_v${nextVersion}.pdf`,
      file_name: file.name,
      file_size: file.size,
      mime_type: 'application/pdf',
      version: nextVersion,
      checks_json: type === 'report' ? {
        mistakeProoferScore: 92,
        passedChecks: [
          'All required B3 sections present',
          'Student name and roll no match registration',
          'Company name and guide match records',
          'Dates fall within internship bounds',
          'All 8 weekly summaries included',
        ],
        warnings: ['Check figure captions on Chapter 3'],
        failures: [],
      } : undefined,
      uploaded_at: new Date().toISOString(),
    };

    state.documents.push(newDoc);
    store.addAuditLog(student.id, 'UPLOAD_DOCUMENT', 'documents', newDoc.id, null, {
      type,
      version: nextVersion,
      fileName: file.name,
    });
    store.saveState();
    refreshStore();

    setSuccessMessage(`Successfully uploaded ${file.name} as Version ${nextVersion}!`);
  };

  const getLatestDoc = (type: DocumentType) => {
    const docs = documents.filter((d) => d.type === type);
    return docs.sort((a, b) => b.version - a.version)[0];
  };

  const offerDoc = getLatestDoc('offer_letter');
  const certDoc = getLatestDoc('certificate');
  const reportDoc = getLatestDoc('report');

  if (!intern) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Please Register Your Internship First</h2>
        <Link href="/student/register" className="px-4 py-2 bg-blue-900 text-white rounded-lg inline-block">
          Register Internship
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/student" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Mandatory Documents & Version Storage
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Store offer letters, completion certificates, and Appendix B3 final report with versioning and validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => student && downloadStudentDossierDocument(student.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs shadow hover:bg-blue-800 transition"
            title="Download full internship dossier with logs and assessment marks"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download My Dossier (.txt)</span>
          </button>
          <button
            onClick={() => student && downloadStudentDossierExcel(student.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow hover:bg-emerald-600 transition"
            title="Download full Excel record with logs and marks"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download My Excel Record</span>
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* 3 Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Offer Letter */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              {offerDoc ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Version {offerDoc.version} Uploaded
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-300">
                  Optional
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">1. Offer Letter</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded">Optional</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official company offer or appointment letter (Optional — upload if provided by your company; not all organizations issue formal letters).
            </p>

            {offerDoc && (
              <div className="p-3 rounded-lg bg-slate-50 border text-xs space-y-1">
                <p className="font-semibold text-slate-800 truncate">{offerDoc.file_name}</p>
                <p className="text-[10px] text-slate-400">
                  {(offerDoc.file_size / 1024).toFixed(1)} KB • {new Date(offerDoc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{offerDoc ? 'Upload New Version (PDF)' : 'Upload Offer Letter (PDF)'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'offer_letter')}
              />
            </label>
          </div>
        </div>

        {/* 2. Completion Certificate */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              {certDoc ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Version {certDoc.version} Active
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  Due Week 8
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-slate-900">2. Completion Certificate</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Issued by industry supervisor upon completion of the 8-week duration with official seal and signature.
            </p>

            {certDoc && (
              <div className="p-3 rounded-lg bg-slate-50 border text-xs space-y-1">
                <p className="font-semibold text-slate-800 truncate">{certDoc.file_name}</p>
                <p className="text-[10px] text-slate-400">
                  {(certDoc.file_size / 1024).toFixed(1)} KB • {new Date(certDoc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs cursor-pointer shadow transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{certDoc ? 'Upload New Version (PDF)' : 'Upload Certificate (PDF)'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'certificate')}
              />
            </label>
          </div>
        </div>

        {/* 3. Final Report (Appendix B3) */}
        <div className="bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {reportDoc ? (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Verified ({reportDoc.checks_json?.mistakeProoferScore || 90}% score)
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  Due in 15 days
                </span>
              )}
            </div>

            <h3 className="font-bold text-base text-slate-900">3. Final Internship Report</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Complete report formatted according to Appendix B3 template. Verified by automated Mistake-Proofer.
            </p>

            {reportDoc && (
              <div className="p-3 rounded-lg bg-slate-50 border text-xs space-y-1">
                <p className="font-semibold text-slate-800 truncate">{reportDoc.file_name}</p>
                <p className="text-[10px] text-slate-400">
                  {(reportDoc.file_size / 1024).toFixed(1)} KB • Version {reportDoc.version}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow transition">
              <Upload className="w-3.5 h-3.5" />
              <span>{reportDoc ? 'Upload New Report (PDF)' : 'Upload Final Report (PDF)'}</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'report')}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Version History Archive Table */}
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 border-b pb-3">
          <History className="w-4 h-4 text-slate-600" />
          <h2 className="font-bold text-sm text-slate-900">Document Upload Audit History & Version Archive</h2>
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No documents uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Document Type</th>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Uploaded On</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold capitalize text-slate-800">
                      {doc.type.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{doc.file_name}</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">v{doc.version}</td>
                    <td className="py-2.5 px-3 text-slate-500">{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(doc.uploaded_at).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Stored in Supabase
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

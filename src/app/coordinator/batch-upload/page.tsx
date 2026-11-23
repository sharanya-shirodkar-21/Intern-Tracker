'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  Trash2, 
  Plus, 
  Save,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Profile } from '@/types/database';

interface ParsedRow {
  id: string;
  roll_no: string;
  name: string;
  email: string;
  phone: string;
  batch: string;
  semester: string;
  errors: string[];
}

export default function BatchUploadPage() {
  const { storeState, refreshStore } = useAuth();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateRow = (r: Omit<ParsedRow, 'errors'>, existingRows: ParsedRow[]): string[] => {
    const errs: string[] = [];
    if (!r.roll_no.trim()) errs.push('Roll No is required');
    if (!r.name.trim()) errs.push('Name is required');
    if (!r.email.trim()) {
      errs.push('Email is required');
    } else if (!emailRegex.test(r.email.trim())) {
      errs.push('Invalid email format');
    }

    // Duplicate check in batch
    const dupRoll = existingRows.filter((item) => item.id !== r.id && item.roll_no.toLowerCase() === r.roll_no.toLowerCase());
    if (dupRoll.length > 0) errs.push('Duplicate Roll No in batch');

    const dupEmail = existingRows.filter((item) => item.id !== r.id && item.email.toLowerCase() === r.email.toLowerCase());
    if (dupEmail.length > 0) errs.push('Duplicate Email in batch');

    return errs;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) return;

      // Header row
      const parsed: ParsedRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length < 3) continue;

        const rowData = {
          id: `batch-${Date.now()}-${i}`,
          roll_no: parts[0] || '',
          name: parts[1] || '',
          email: parts[2] || '',
          phone: parts[3] || '',
          batch: parts[4] || '2021-2025',
          semester: parts[5] || 'VII',
        };

        const errors = validateRow(rowData, parsed);
        parsed.push({ ...rowData, errors });
      }

      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleBatch = () => {
    const samples: Omit<ParsedRow, 'errors'>[] = [
      { id: 'sample-1', roll_no: '21ETC31', name: 'Darren Alvares', email: 'darren.21etc31@dbce.edu', phone: '9822000031', batch: '2021-2025', semester: 'VII' },
      { id: 'sample-2', roll_no: '21ETC32', name: 'Esha Naik', email: 'esha.21etc32@dbce.edu', phone: '9822000032', batch: '2021-2025', semester: 'VII' },
      { id: 'sample-3', roll_no: '21ETC33', name: 'Faizan Jamadar', email: 'invalid-email-address', phone: '9822000033', batch: '2021-2025', semester: 'VII' }, // intentional error to demo fixing
      { id: 'sample-4', roll_no: '21ETC34', name: 'Glenda Miranda', email: 'glenda.21etc34@dbce.edu', phone: '9822000034', batch: '2021-2025', semester: 'VII' },
    ];

    const validated = samples.map((s, idx, arr) => ({
      ...s,
      errors: validateRow(s, arr as any),
    }));

    setRows(validated);
  };

  const handleCellChange = (id: string, field: keyof ParsedRow, value: string) => {
    setRows((prev) => {
      const updated = prev.map((row) => (row.id === id ? { ...row, [field]: value } : row));
      // Re-validate all
      return updated.map((r) => ({
        ...r,
        errors: validateRow(r, updated),
      }));
    });
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => {
      const remaining = prev.filter((r) => r.id !== id);
      return remaining.map((r) => ({
        ...r,
        errors: validateRow(r, remaining),
      }));
    });
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Roll No,Name,Email,Phone,Batch,Semester\n' +
      '21ETC01,Aarav Vernekar,aarav.21etc01@dbce.edu,9822000001,2021-2025,VII\n' +
      '21ETC02,Alisha DSouza,alisha.21etc02@dbce.edu,9822000002,2021-2025,VII\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'InternTrack_Batch_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalErrors = rows.reduce((sum, r) => sum + r.errors.length, 0);

  const handleCommitImport = () => {
    if (totalErrors > 0) {
      alert('Please correct all errors in the table before importing.');
      return;
    }

    const store = StoreManager.getInstance();
    const state = store.getState();

    const newProfiles: Profile[] = rows.map((r) => ({
      id: `33333333-3333-3333-3333-${Date.now()}-${r.roll_no}`,
      role: 'student',
      name: r.name,
      email: r.email,
      phone: r.phone,
      roll_no: r.roll_no,
      batch: r.batch,
      semester: r.semester,
      department: 'Electronics & Telecommunication',
      created_at: new Date().toISOString(),
    }));

    state.profiles.push(...newProfiles);
    store.addAuditLog('coordinator', 'BATCH_IMPORT_STUDENTS', 'profiles', 'batch', null, { importedCount: newProfiles.length });
    store.saveState();
    refreshStore();

    setImportSuccessMessage(`Successfully imported ${newProfiles.length} students into the department directory!`);
    setRows([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/coordinator" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Batch Student Ingestion</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload CSV/Excel batch lists, inspect errors per row, correct them inline, and import into the active cohort.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>

          <button
            onClick={handleLoadSampleBatch}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Load Demo Batch with Errors</span>
          </button>
        </div>
      </div>

      {importSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{importSuccessMessage}</span>
          </div>
          <Link href="/coordinator" className="font-bold underline text-emerald-800">
            View in Dashboard →
          </Link>
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <label htmlFor="csv-input" className="cursor-pointer font-bold text-sm text-blue-700 hover:underline">
            Click to upload batch CSV/XLSX file
          </label>
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <p className="text-xs text-slate-500 mt-1">Expected columns: Roll No, Name, Email, Phone, Batch, Semester</p>
        </div>
      </div>

      {/* Preview & Inline Error Correction Table */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900">Pre-Import Validation Matrix</h2>
              <p className="text-xs text-slate-500">
                {rows.length} rows loaded •{' '}
                {totalErrors > 0 ? (
                  <span className="text-red-600 font-bold">{totalErrors} errors detected (click cell to edit)</span>
                ) : (
                  <span className="text-emerald-600 font-bold">All rows valid and ready to import!</span>
                )}
              </p>
            </div>

            <button
              onClick={handleCommitImport}
              disabled={totalErrors > 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition ${
                totalErrors > 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Commit & Import {rows.length} Students</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Batch / Sem</th>
                  <th className="py-2.5 px-3">Validation Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => {
                  const hasError = row.errors.length > 0;
                  return (
                    <tr key={row.id} className={hasError ? 'bg-red-50/40' : 'hover:bg-slate-50'}>
                      {/* Roll No */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.roll_no}
                          onChange={(e) => handleCellChange(row.id, 'roll_no', e.target.value)}
                          className="w-24 p-1 border rounded text-xs font-mono font-bold"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleCellChange(row.id, 'name', e.target.value)}
                          className="w-44 p-1 border rounded text-xs"
                        />
                      </td>

                      {/* Email */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.email}
                          onChange={(e) => handleCellChange(row.id, 'email', e.target.value)}
                          className="w-56 p-1 border rounded text-xs"
                        />
                      </td>

                      {/* Phone */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.phone}
                          onChange={(e) => handleCellChange(row.id, 'phone', e.target.value)}
                          className="w-28 p-1 border rounded text-xs"
                        />
                      </td>

                      {/* Batch */}
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                        {row.batch} • {row.semester}
                      </td>

                      {/* Validation Status & Error list */}
                      <td className="py-2 px-3">
                        {hasError ? (
                          <div className="space-y-0.5">
                            {row.errors.map((err, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                                <AlertCircle className="w-2.5 h-2.5" />
                                {err}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" />
                            Valid
                          </span>
                        )}
                      </td>

                      {/* Remove Row */}
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

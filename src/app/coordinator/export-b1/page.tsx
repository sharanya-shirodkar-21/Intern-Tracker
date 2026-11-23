'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { 
  FileSpreadsheet, 
  Download, 
  Settings, 
  ArrowLeft, 
  CheckCircle,
  Building,
  Calendar,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { 
  B1ExportConfig, 
  defaultB1Config, 
  downloadB1Excel 
} from '@/lib/excel-b1-export';

export default function ExportB1Page() {
  const { storeState } = useAuth();
  const [config, setConfig] = useState<B1ExportConfig>(defaultB1Config);

  const students = storeState.profiles.filter((p) => p.role === 'student');
  const guides = storeState.profiles.filter((p) => p.role === 'guide');
  const internships = storeState.internships;
  const assignments = storeState.guideAssignments;

  const handleDownload = () => {
    downloadB1Excel(students, internships, assignments, guides, config);
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appendix B1: Internship Group List Export</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configurable college layout generator matching official document specification DBCE/2021-2022/Ver1.0.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Download Appendix B1 Excel (.xlsx)</span>
        </button>
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Settings className="w-4 h-4 text-blue-700" />
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-800">
            Document Metadata Customizer (Configurable Parameters)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Department</label>
            <input
              type="text"
              value={config.department}
              onChange={(e) => setConfig({ ...config, department: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Date Window</label>
            <input
              type="text"
              value={config.dateWindow}
              onChange={(e) => setConfig({ ...config, dateWindow: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Document No</label>
            <input
              type="text"
              value={config.documentNo}
              onChange={(e) => setConfig({ ...config, documentNo: e.target.value })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Batch & Semester</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.batch}
                onChange={(e) => setConfig({ ...config, batch: e.target.value })}
                className="w-2/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Batch"
              />
              <input
                type="text"
                value={config.semester}
                onChange={(e) => setConfig({ ...config, semester: e.target.value })}
                className="w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Sem"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Exact Appendix B1 Layout Preview */}
      <div className="bg-white rounded-xl border shadow-lg overflow-hidden p-6 space-y-6">
        {/* Banner Mock */}
        <div className="text-center space-y-1 border-b pb-4">
          <h3 className="font-black text-sm uppercase tracking-wide text-slate-900">{config.collegeName}</h3>
          <p className="font-bold text-xs text-blue-900">Department of {config.department}</p>
          <h4 className="font-extrabold text-sm text-slate-800">Internship Group List ({config.dateWindow})</h4>
          <p className="text-[11px] font-mono text-slate-500">
            Doc No: {config.documentNo} | Course: {config.courseCode} | Batch: {config.batch} | Sem: {config.semester}
          </p>
        </div>

        {/* Table Preview */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b text-slate-700 font-bold text-[10px]">
                <th className="p-2 border-r">Sr.No</th>
                <th className="p-2 border-r">Roll NO</th>
                <th className="p-2 border-r">Name of the Student</th>
                <th className="p-2 border-r">Email ID</th>
                <th className="p-2 border-r">Phone Number</th>
                <th className="p-2 border-r">Start Date</th>
                <th className="p-2 border-r">End Date</th>
                <th className="p-2 border-r">Company Details (Address, E-mail, Phone)</th>
                <th className="p-2 border-r">Internal Guide</th>
                <th className="p-2 text-center">Signature of Internal Guide</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.slice(0, 10).map((s, idx) => {
                const intern = internships.find((i) => i.student_id === s.id);
                const assign = assignments.find((a) => a.student_id === s.id);
                const guide = guides.find((g) => g.id === assign?.guide_id);

                return (
                  <tr key={s.id} className="hover:bg-slate-50 text-[11px]">
                    <td className="p-2 border-r text-center">{idx + 1}</td>
                    <td className="p-2 border-r font-mono font-bold">{s.roll_no}</td>
                    <td className="p-2 border-r font-medium">{s.name}</td>
                    <td className="p-2 border-r">{s.email}</td>
                    <td className="p-2 border-r">{s.phone}</td>
                    <td className="p-2 border-r">{intern?.start_date || '-'}</td>
                    <td className="p-2 border-r">{intern?.end_date || '-'}</td>
                    <td className="p-2 border-r">
                      {intern ? (
                        <div>
                          <p className="font-semibold text-slate-900">{intern.company_name}</p>
                          <p className="text-[10px] text-slate-500">{intern.address}</p>
                          <p className="text-[10px] text-slate-500">Ph: {intern.company_phone} | Em: {intern.company_email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Registered</span>
                      )}
                    </td>
                    <td className="p-2 border-r font-medium text-slate-800">{guide?.name || 'Unassigned'}</td>
                    <td className="p-2 text-center text-slate-300 italic text-[10px]">[Blank for Physical Sign]</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-2 bg-slate-50 text-center text-slate-400 text-xs border-t">
            ... Showing top 10 of {students.length} students in live preview. Full batch exported on download.
          </div>
        </div>

        {/* 5-Tier Signatory Footer Mock */}
        <div className="pt-4 border-t grid grid-cols-5 gap-2 text-center">
          <div className="p-3 border-t-2 border-slate-400 font-bold text-xs text-slate-800">
            Internship Coordinator
          </div>
          <div className="p-3 border-t-2 border-slate-400 font-bold text-xs text-slate-800">
            Head of Department
          </div>
          <div className="p-3 border-t-2 border-slate-400 font-bold text-xs text-slate-800">
            Approved By
          </div>
          <div className="p-3 border-t-2 border-slate-400 font-bold text-xs text-slate-800">
            Principal
          </div>
          <div className="p-3 border-t-2 border-slate-400 font-bold text-xs text-slate-800">
            Director
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { StoreManager } from '@/lib/store';
import { 
  Users, 
  Scale, 
  CheckSquare, 
  Square, 
  ArrowLeft, 
  CheckCircle, 
  UserCheck,
  Search,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function GuideMappingPage() {
  const { storeState, refreshStore } = useAuth();
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkGuideId, setBulkGuideId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const students = storeState.profiles.filter((p) => p.role === 'student');
  const guides = storeState.profiles.filter((p) => p.role === 'guide');
  const assignments = storeState.guideAssignments;

  // Guide loads
  const getGuideStudentCount = (guideId: string) => {
    return assignments.filter((a) => a.guide_id === guideId).length;
  };

  const handleManualAssign = (studentId: string, newGuideId: string) => {
    const store = StoreManager.getInstance();
    const state = store.getState();

    const existingIdx = state.guideAssignments.findIndex((a) => a.student_id === studentId);
    if (existingIdx >= 0) {
      state.guideAssignments[existingIdx].guide_id = newGuideId;
    } else {
      state.guideAssignments.push({
        id: `assign-${Date.now()}`,
        student_id: studentId,
        guide_id: newGuideId,
        assigned_at: new Date().toISOString(),
      });
    }

    store.addAuditLog('coordinator', 'MANUAL_GUIDE_ASSIGN', 'guide_assignments', studentId, null, { guide_id: newGuideId });
    store.saveState();
    refreshStore();

    setMessage({ text: 'Updated guide assignment.', type: 'success' });
  };

  const handleBulkAssign = () => {
    if (!bulkGuideId || selectedStudentIds.length === 0) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    selectedStudentIds.forEach((sId) => {
      const existingIdx = state.guideAssignments.findIndex((a) => a.student_id === sId);
      if (existingIdx >= 0) {
        state.guideAssignments[existingIdx].guide_id = bulkGuideId;
      } else {
        state.guideAssignments.push({
          id: `assign-${Date.now()}-${sId}`,
          student_id: sId,
          guide_id: bulkGuideId,
          assigned_at: new Date().toISOString(),
        });
      }
    });

    store.addAuditLog('coordinator', 'BULK_GUIDE_ASSIGN', 'guide_assignments', 'bulk', null, {
      guide_id: bulkGuideId,
      studentCount: selectedStudentIds.length,
    });
    store.saveState();
    refreshStore();

    setMessage({
      text: `Assigned ${selectedStudentIds.length} students to selected faculty guide.`,
      type: 'success',
    });
    setSelectedStudentIds([]);
  };

  // Smart Auto-Balance Algorithm
  const handleAutoBalance = () => {
    if (guides.length === 0 || students.length === 0) return;

    const store = StoreManager.getInstance();
    const state = store.getState();

    // Distribute all students in a balanced round-robin manner across available guides
    state.guideAssignments = students.map((s, idx) => ({
      id: `assign-bal-${idx + 1}`,
      student_id: s.id,
      guide_id: guides[idx % guides.length].id,
      assigned_at: new Date().toISOString(),
    }));

    store.addAuditLog('coordinator', 'AUTO_BALANCE_GUIDES', 'guide_assignments', 'all', null, {
      totalStudents: students.length,
      guidesCount: guides.length,
    });
    store.saveState();
    refreshStore();

    const perGuide = Math.ceil(students.length / guides.length);
    setMessage({
      text: `Auto-balanced ${students.length} students across ${guides.length} guides (~${perGuide} students each)!`,
      type: 'success',
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleToggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/coordinator" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Faculty Guide Mapping</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign students individually, execute bulk transfers, or use the 1-click Auto-Balance engine.
          </p>
        </div>

        <button
          onClick={handleAutoBalance}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition hover:scale-105"
        >
          <Scale className="w-4 h-4 text-purple-200" />
          <span>Auto-Balance All Students Evenly</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Guide Workload Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {guides.map((g) => {
          const count = getGuideStudentCount(g.id);
          return (
            <div key={g.id} className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">{g.department}</span>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{g.name}</p>
                <p className="text-[11px] text-slate-500">{g.email}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{count}</span>
                <span className="text-[10px] text-slate-500 block">students</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Action Bar */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
          >
            {selectedStudentIds.length === students.length ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All ({selectedStudentIds.length} chosen)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={bulkGuideId}
            onChange={(e) => setBulkGuideId(e.target.value)}
            className="p-2 text-xs border rounded-lg bg-white text-slate-800"
          >
            <option value="">-- Choose Guide for Bulk Assign --</option>
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({getGuideStudentCount(g.id)} curr.)
              </option>
            ))}
          </select>

          <button
            onClick={handleBulkAssign}
            disabled={!bulkGuideId || selectedStudentIds.length === 0}
            className={`px-3 py-2 rounded-lg font-bold text-xs transition ${
              !bulkGuideId || selectedStudentIds.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
          >
            Assign Selected
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg"
            />
          </div>
          <span className="text-xs text-slate-500">{filteredStudents.length} students</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4 w-10"></th>
                <th className="py-2.5 px-4">Roll No</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Current Assigned Guide</th>
                <th className="py-2.5 px-4 text-right">Change Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                const currentAssign = assignments.find((a) => a.student_id === s.id);

                return (
                  <tr key={s.id} className={isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}>
                    <td className="py-2.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleStudent(s.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{s.roll_no}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-4">
                      {currentAssign ? (
                        <span className="text-slate-800 font-medium">
                          {guides.find((g) => g.id === currentAssign.guide_id)?.name}
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold text-[10px] bg-red-50 px-1.5 py-0.5 rounded">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <select
                        value={currentAssign?.guide_id || ''}
                        onChange={(e) => handleManualAssign(s.id, e.target.value)}
                        className="p-1 border rounded text-xs bg-white text-slate-800"
                      >
                        <option value="" disabled>-- Select Guide --</option>
                        {guides.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

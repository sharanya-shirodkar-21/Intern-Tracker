import * as XLSX from 'xlsx';
import { StoreManager } from '@/lib/store';
import { Profile, Internship, WeeklyLog, LogEntry, DocumentRecord, StudentMarksEvaluation } from '@/types/database';

export interface StudentDossier {
  student: Profile;
  internship?: Internship;
  guide?: Profile;
  marks: StudentMarksEvaluation;
  logs: WeeklyLog[];
  entries: LogEntry[];
  documents: DocumentRecord[];
  certificateDoc?: DocumentRecord;
  reportDoc?: DocumentRecord;
  offerDoc?: DocumentRecord;
  completedWeeksCount: number;
  isFullyCompleted: boolean;
  completionStatus: 'Completed' | 'In Progress' | 'Remaining' | 'Unregistered';
}

export function getStudentDossierData(studentId: string): StudentDossier | null {
  const store = StoreManager.getInstance();
  const state = store.getState();

  const student = state.profiles.find((p) => p.id === studentId);
  if (!student) return null;

  const intern = state.internships.find((i) => i.student_id === student.id);
  const assignment = state.guideAssignments.find((a) => a.student_id === student.id);
  const guide = state.profiles.find((p) => p.id === assignment?.guide_id);

  const logs = intern
    ? state.weeklyLogs.filter((w) => w.internship_id === intern.id).sort((a, b) => a.week_no - b.week_no)
    : [];
  const entries = state.logEntries;
  const documents = intern ? state.documents.filter((d) => d.internship_id === intern.id) : [];

  const certificateDoc = documents.find((d) => d.type === 'certificate');
  const reportDoc = documents.find((d) => d.type === 'report');
  const offerDoc = documents.find((d) => d.type === 'offer_letter');

  const populatedWeeks = logs.filter((w) => entries.some((e) => e.weekly_log_id === w.id));
  const completedWeeksCount = populatedWeeks.length;

  // Fully completed requires: All 8 weeks logged + Certificate + Report (Offer letter is OPTIONAL)
  const isFullyCompleted = Boolean(intern && completedWeeksCount >= 8 && certificateDoc && reportDoc);

  let completionStatus: 'Completed' | 'In Progress' | 'Remaining' | 'Unregistered' = 'Unregistered';
  if (!intern) {
    completionStatus = 'Unregistered';
  } else if (isFullyCompleted) {
    completionStatus = 'Completed';
  } else if (completedWeeksCount > 0) {
    completionStatus = 'In Progress';
  } else {
    completionStatus = 'Remaining';
  }

  // Find or derive marks out of 30
  let marks = state.studentMarks?.find((m) => m.student_id === student.id);
  if (!marks) {
    // Standard rubric out of 30:
    // Log regularity (0-10), Supervisor verification (0-10), Report quality (0-10)
    let logMarks = Math.min(Math.round((completedWeeksCount / 8) * 10), 10);
    const confirmedCount = logs.filter((w) =>
      state.supervisorConfirmations.some((c) => c.weekly_log_id === w.id && c.status === 'confirmed')
    ).length;
    let supMarks = Math.min(Math.round((confirmedCount / 8) * 10), 10);
    let repMarks = reportDoc ? 9 : isFullyCompleted ? 8 : completedWeeksCount >= 4 ? 6 : 4;

    if (!intern) {
      logMarks = 0;
      supMarks = 0;
      repMarks = 0;
    }

    marks = {
      id: `marks-${student.id}`,
      student_id: student.id,
      internship_id: intern?.id || '',
      log_regularity_marks: logMarks,
      supervisor_verification_marks: supMarks,
      report_quality_marks: repMarks,
      total_marks: logMarks + supMarks + repMarks,
      graded_by: guide?.name || 'Dr. Shailesh Khanolkar',
      comments: isFullyCompleted
        ? 'Excellent industry performance. Completed all 8 weeks with verified technical logs.'
        : 'Continuous assessment in progress.',
      updated_at: new Date().toISOString(),
    };
  }

  return {
    student,
    internship: intern,
    guide,
    marks,
    logs,
    entries,
    documents,
    certificateDoc,
    reportDoc,
    offerDoc,
    completedWeeksCount,
    isFullyCompleted,
    completionStatus,
  };
}

// Download individual student dossier as formatted printable text/doc
export function downloadStudentDossierDocument(studentId: string) {
  const dossier = getStudentDossierData(studentId);
  if (!dossier) return;

  const { student, internship, guide, marks, logs, entries, certificateDoc, reportDoc, offerDoc } = dossier;

  let text = '';
  text += '================================================================================\n';
  text += 'DON BOSCO COLLEGE OF ENGINEERING - FATORDA, MARGAO, GOA\n';
  text += 'DEPARTMENT OF ELECTRONICS & TELECOMMUNICATION ENGINEERING\n';
  text += 'COURSE ET740: BE SEMESTER VII INDUSTRIAL INTERNSHIP (8 WEEKS)\n';
  text += 'INDIVIDUAL STUDENT INTERNSHIP DOSSIER & ASSESSMENT RECORD\n';
  text += 'Document Ref: DBCE/2021-2022/Ver1.0\n';
  text += '================================================================================\n\n';

  text += '1. STUDENT INFORMATION\n';
  text += `--------------------------------------------------------------------------------\n`;
  text += `Roll Number       : ${student.roll_no || 'N/A'}\n`;
  text += `Student Name      : ${student.name}\n`;
  text += `Email Address     : ${student.email}\n`;
  text += `Contact Phone     : ${student.phone || 'N/A'}\n`;
  text += `Department        : ${student.department}\n`;
  text += `Academic Cohort   : Batch ${student.batch} | Semester ${student.semester}\n\n`;

  text += '2. INDUSTRY PLACEMENT DETAILS\n';
  text += `--------------------------------------------------------------------------------\n`;
  if (internship) {
    text += `Company Name      : ${internship.company_name}\n`;
    text += `Company Address   : ${internship.address}\n`;
    text += `Technical Domain  : ${internship.domain}\n`;
    text += `Internship Mode   : ${internship.mode.toUpperCase()}\n`;
    text += `Duration Window   : ${internship.start_date} to ${internship.end_date} (8 Weeks)\n`;
    text += `Industry Mentor   : ${internship.supervisor_name} (${internship.supervisor_designation})\n`;
    text += `Supervisor Email  : ${internship.supervisor_email}\n`;
    text += `Internal Guide    : ${guide?.name || 'Assigned Faculty Guide'}\n\n`;
  } else {
    text += `Status: NOT REGISTERED YET\n\n`;
  }

  text += '3. CONTINUOUS ASSESSMENT MARKS (OUT OF 30)\n';
  text += `--------------------------------------------------------------------------------\n`;
  text += `Assessment Criteria                                      Max Marks   Awarded\n`;
  text += `--------------------------------------------------------------------------------\n`;
  text += `1. Weekly Log Timeliness & Anti-Backfill Regularity       10          ${marks.log_regularity_marks}\n`;
  text += `2. Industry Supervisor Verification & Workplace Conduct   10          ${marks.supervisor_verification_marks}\n`;
  text += `3. Technical Depth, Final Report & Presentation Quality    10          ${marks.report_quality_marks}\n`;
  text += `--------------------------------------------------------------------------------\n`;
  text += `TOTAL CONTINUOUS EVALUATION MARKS                         30          ${marks.total_marks} / 30\n`;
  text += `--------------------------------------------------------------------------------\n`;
  text += `Faculty Evaluator : ${marks.graded_by || 'Department Evaluator'}\n`;
  text += `Faculty Remarks   : ${marks.comments || 'Satisfactory overall performance.'}\n\n`;

  text += '4. MANDATORY DELIVERABLES & CERTIFICATES\n';
  text += `--------------------------------------------------------------------------------\n`;
  text += `Completion Certificate : ${certificateDoc ? `[SUBMITTED] ${certificateDoc.file_name} (v${certificateDoc.version})` : '[PENDING] Not uploaded'}\n`;
  text += `Final Internship Report: ${reportDoc ? `[SUBMITTED] ${reportDoc.file_name} (v${reportDoc.version})` : '[PENDING] Not uploaded'}\n`;
  text += `Offer Letter (Optional): ${offerDoc ? `[SUBMITTED] ${offerDoc.file_name}` : '[NOT SUBMITTED] (Optional per college policy - not all companies issue offer letters)'}\n\n`;

  text += '5. APPENDIX B2: 8-WEEK PROGRESS LOG TABLE SUMMARY\n';
  text += `--------------------------------------------------------------------------------\n`;
  if (logs.length === 0) {
    text += `No weekly log tables initialized.\n`;
  } else {
    logs.forEach((w) => {
      const wEntries = entries.filter((e) => e.weekly_log_id === w.id);
      text += `\n[WEEK ${w.week_no}] Period: ${w.week_start} to ${w.week_end} | Status: ${w.locked_at ? 'Locked' : 'Open'}\n`;
      if (wEntries.length === 0) {
        text += `  - Work Carried Out: No daily entries logged.\n`;
      } else {
        wEntries.forEach((e) => {
          text += `  - Date: ${e.entry_date} | Work: ${e.content}\n`;
        });
      }
      text += `  - Tamper-Evident Hash: ${w.hash ? w.hash.slice(0, 24) + '...' : 'Pending weekly seal'}\n`;
    });
  }

  text += '\n================================================================================\n';
  text += 'INSTITUTIONAL ENDORSEMENT\n';
  text += `Internal Faculty Guide: ________________________   Date: ${new Date().toLocaleDateString()}\n`;
  text += `Internship Coordinator: ________________________   Head of Department: ________________________\n`;
  text += '================================================================================\n';

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ET740_Dossier_${student.roll_no || 'student'}_${student.name.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Download individual student data as Excel (.xlsx)
export function downloadStudentDossierExcel(studentId: string) {
  const dossier = getStudentDossierData(studentId);
  if (!dossier) return;

  const { student, internship, guide, marks, logs, entries, certificateDoc, reportDoc, offerDoc } = dossier;

  // Sheet 1: Summary & Marks
  const summaryData = [
    ['DON BOSCO COLLEGE OF ENGINEERING - DEPARTMENT OF ELECTRONICS & TELECOMMUNICATION'],
    ['ET740 INDUSTRIAL INTERNSHIP INDIVIDUAL STUDENT DOSSIER'],
    [''],
    ['STUDENT DETAILS'],
    ['Roll Number', student.roll_no || ''],
    ['Student Name', student.name],
    ['Email', student.email],
    ['Phone', student.phone || ''],
    ['Batch', student.batch],
    ['Semester', student.semester],
    [''],
    ['INTERNSHIP DETAILS'],
    ['Company Name', internship?.company_name || 'Unregistered'],
    ['Company Address', internship?.address || ''],
    ['Technical Domain', internship?.domain || ''],
    ['Internship Mode', internship?.mode?.toUpperCase() || ''],
    ['Start Date', internship?.start_date || ''],
    ['End Date', internship?.end_date || ''],
    ['Industry Supervisor', internship?.supervisor_name || ''],
    ['Supervisor Designation', internship?.supervisor_designation || ''],
    ['Supervisor Email', internship?.supervisor_email || ''],
    ['Faculty Guide', guide?.name || 'Unassigned'],
    [''],
    ['CONTINUOUS ASSESSMENT MARKS (OUT OF 30)'],
    ['Criterion 1: Log Timeliness & Regularity (Max 10)', marks.log_regularity_marks],
    ['Criterion 2: Industry Supervisor Verification (Max 10)', marks.supervisor_verification_marks],
    ['Criterion 3: Technical Depth & Report Quality (Max 10)', marks.report_quality_marks],
    ['TOTAL MARKS (OUT OF 30)', marks.total_marks],
    ['Evaluator Remarks', marks.comments || 'Satisfactory'],
    [''],
    ['DOCUMENT AUDIT STATUS'],
    ['Completion Certificate', certificateDoc ? 'Submitted' : 'Pending'],
    ['Final Report (Appendix B3)', reportDoc ? 'Submitted' : 'Pending'],
    ['Offer Letter (Optional)', offerDoc ? 'Submitted' : 'Not Submitted (Optional)'],
    ['Overall Status', dossier.completionStatus],
  ];

  // Sheet 2: Weekly Logs
  const logRows = [
    ['Week No', 'Period Start', 'Period End', 'Entry Date', 'Work Carried Out / Learnt', 'Supervisor Status', 'Hash Chain'],
  ];

  logs.forEach((w) => {
    const wEntries = entries.filter((e) => e.weekly_log_id === w.id);
    if (wEntries.length === 0) {
      logRows.push([`Week ${w.week_no}`, w.week_start, w.week_end, 'No Entries', 'Pending', 'Unconfirmed', w.hash || '']);
    } else {
      wEntries.forEach((e) => {
        logRows.push([`Week ${w.week_no}`, w.week_start, w.week_end, e.entry_date, e.content, 'Verified', w.hash || '']);
      });
    }
  });

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  const wsLogs = XLSX.utils.aoa_to_sheet(logRows);

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Student_Dossier');
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Weekly_Progress_Logs_B2');

  XLSX.writeFile(wb, `ET740_Student_${student.roll_no || 'Record'}_${student.name.replace(/\s+/g, '_')}.xlsx`);
}

// Download Comprehensive Cohort Spreadsheet (For Faculty Coordinator)
export function downloadCohortComprehensiveExcel() {
  const store = StoreManager.getInstance();
  const state = store.getState();
  const students = state.profiles.filter((p) => p.role === 'student');

  const headers = [
    'Sr.No',
    'Roll No',
    'Student Name',
    'Email',
    'Phone',
    'Company Name',
    'Technical Domain',
    'Mode',
    'Industry Supervisor',
    'Internal Guide',
    'Weekly Logs Completed',
    'Certificate Status',
    'Report Status',
    'Offer Letter Status (Optional)',
    'Log Marks (/10)',
    'Supervisor Marks (/10)',
    'Report Marks (/10)',
    'Total Marks (/30)',
    'Completion Status',
  ];

  const rows = students.map((s, idx) => {
    const d = getStudentDossierData(s.id);
    return [
      idx + 1,
      s.roll_no || '',
      s.name,
      s.email,
      s.phone || '',
      d?.internship?.company_name || 'Unregistered',
      d?.internship?.domain || 'N/A',
      d?.internship?.mode?.toUpperCase() || 'N/A',
      d?.internship?.supervisor_name || 'N/A',
      d?.guide?.name || 'Unassigned',
      `${d?.completedWeeksCount || 0} / 8`,
      d?.certificateDoc ? 'Submitted' : 'Pending',
      d?.reportDoc ? 'Submitted' : 'Pending',
      d?.offerDoc ? 'Submitted' : 'Optional (Not Submitted)',
      d?.marks.log_regularity_marks || 0,
      d?.marks.supervisor_verification_marks || 0,
      d?.marks.report_quality_marks || 0,
      d?.marks.total_marks || 0,
      d?.completionStatus || 'Unregistered',
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ['DON BOSCO COLLEGE OF ENGINEERING - DEPARTMENT OF ELECTRONICS & TELECOMMUNICATION'],
    ['BE SEMESTER VII INTERNSHIP (ET740) - COHORT COMPLETION & ASSESSMENT AUDIT (MARKS OUT OF 30)'],
    [`Academic Year: 2024-2025 | Date Generated: ${new Date().toLocaleDateString()}`],
    [],
    headers,
    ...rows,
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cohort_Assessment_Audit');
  XLSX.writeFile(wb, 'ET740_Cohort_Completion_And_Marks_Assessment_2024_2025.xlsx');
}

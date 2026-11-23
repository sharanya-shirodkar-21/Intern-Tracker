import { StoreManager, AppState } from '@/lib/store';
import { Deadline } from '@/types/database';

export interface ScanResult {
  studentRemindersSent: number;
  guideDigestsSent: number;
  studentsAtRiskCount: number;
  details: string[];
}

export function runDeadlineReminderScan(): ScanResult {
  const store = StoreManager.getInstance();
  const state = store.getState();

  const students = state.profiles.filter((p) => p.role === 'student');
  const guides = state.profiles.filter((p) => p.role === 'guide');
  const internships = state.internships;
  const assignments = state.guideAssignments;
  const documents = state.documents;
  const weeklyLogs = state.weeklyLogs;

  let studentRemindersSent = 0;
  let guideDigestsSent = 0;
  const details: string[] = [];

  const guideRiskMap: Record<string, { guideName: string; guideEmail: string; atRiskStudents: string[] }> = {};
  guides.forEach((g) => {
    guideRiskMap[g.id] = { guideName: g.name, guideEmail: g.email, atRiskStudents: [] };
  });

  const now = new Date();

  students.forEach((student) => {
    const intern = internships.find((i) => i.student_id === student.id);
    const assign = assignments.find((a) => a.student_id === student.id);
    const guideId = assign?.guide_id;

    if (!intern) {
      if (guideId && guideRiskMap[guideId]) {
        guideRiskMap[guideId].atRiskStudents.push(`${student.name} (${student.roll_no}) — Internship Not Registered`);
      }
      return;
    }

    const hasOffer = documents.some((d) => d.internship_id === intern.id && d.type === 'offer_letter');
    const studentLogs = weeklyLogs.filter((w) => w.internship_id === intern.id);
    const lockedMissingLogs = studentLogs.filter((w) => w.locked_at && !state.logEntries.some((e) => e.weekly_log_id === w.id));

    // Check Offer Letter Reminder
    if (!hasOffer) {
      studentRemindersSent++;
      details.push(`Reminder dispatched to ${student.name}: Offer letter submission overdue.`);
      
      store.addNotification(
        student.id,
        'Action Required: Offer Letter Due',
        'Your official internship offer letter has not been uploaded. Please upload it under Documents to avoid departmental penalties.',
        '/student/documents'
      );

      store.addOutboxEmail(
        student.email,
        `InternTrack Urgent: Offer Letter Missing (${student.roll_no})`,
        `<p>Dear ${student.name},<br/>Your internship at <b>${intern.company_name}</b> started on ${intern.start_date}. The mandatory offer letter must be submitted within Week 1. Please upload your signed PDF document immediately.<br/><br/><a href="http://localhost:3000/student/documents">Upload Document Portal</a></p>`,
        'reminder'
      );

      if (guideId && guideRiskMap[guideId]) {
        guideRiskMap[guideId].atRiskStudents.push(`${student.name} (${student.roll_no}) — Missing Offer Letter`);
      }
    }

    // Check Weekly Log Reminder
    if (lockedMissingLogs.length > 0) {
      studentRemindersSent++;
      details.push(`Reminder dispatched to ${student.name}: Week log missed/behind.`);

      store.addNotification(
        student.id,
        'Weekly Log Alert: Missed Deadlines',
        `You have ${lockedMissingLogs.length} week(s) locked without entries. Contact your guide immediately.`,
        '/student/weekly-logs'
      );

      if (guideId && guideRiskMap[guideId]) {
        guideRiskMap[guideId].atRiskStudents.push(`${student.name} (${student.roll_no}) — ${lockedMissingLogs.length} Missed Weekly Logs`);
      }
    }
  });

  // Dispatch Guide Digest Emails
  Object.values(guideRiskMap).forEach((gInfo) => {
    if (gInfo.atRiskStudents.length > 0) {
      guideDigestsSent++;
      details.push(`Guide Digest dispatched to ${gInfo.guideName}: ${gInfo.atRiskStudents.length} students at risk.`);

      const listHtml = gInfo.atRiskStudents.map((item) => `<li>${item}</li>`).join('');
      store.addOutboxEmail(
        gInfo.guideEmail,
        `InternTrack Faculty Digest: ${gInfo.atRiskStudents.length} Students At Risk`,
        `<p>Dear ${gInfo.guideName},<br/>The following students assigned to you require mentorship attention regarding ET740 deadlines:</p><ul>${listHtml}</ul><p>Please review their logs on the <a href="http://localhost:3000/guide">Internal Guide Matrix</a>.</p>`,
        'reminder'
      );
    }
  });

  store.saveState();

  const totalAtRisk = Object.values(guideRiskMap).reduce((acc, curr) => acc + curr.atRiskStudents.length, 0);

  return {
    studentRemindersSent,
    guideDigestsSent,
    studentsAtRiskCount: totalAtRisk,
    details,
  };
}

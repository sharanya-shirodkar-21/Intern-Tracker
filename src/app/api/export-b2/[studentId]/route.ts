import { NextRequest, NextResponse } from 'next/server';
import { StoreManager } from '@/lib/store';
import { generateB2Pdf } from '@/lib/b2-pdf-export';

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const studentId = params.studentId;
    const store = StoreManager.getInstance();
    const state = store.getState();

    const student = state.profiles.find((p) => p.id === studentId || p.roll_no?.toLowerCase() === studentId.toLowerCase()) || state.profiles.find((p) => p.role === 'student');
    if (!student) {
      return new NextResponse('Student not found', { status: 404 });
    }

    const intern = state.internships.find((i) => i.student_id === student.id) || state.internships[0];
    const weeklyLogs = state.weeklyLogs.filter((w) => w.internship_id === intern.id);
    const entries = state.logEntries;
    const confirmations = state.supervisorConfirmations;
    const supervisorLink = state.supervisorLinks.find((l) => l.internship_id === intern.id);

    const pdfBytes = await generateB2Pdf(
      student,
      intern,
      weeklyLogs,
      entries,
      confirmations,
      supervisorLink?.raw_token || 'demo-token'
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Appendix_B2_Weekly_Progress_${student.roll_no}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('Failed to generate B2 PDF:', err);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}

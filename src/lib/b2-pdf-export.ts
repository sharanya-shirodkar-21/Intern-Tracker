import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { Profile, Internship, WeeklyLog, LogEntry, SupervisorConfirmation } from '@/types/database';

export async function generateB2Pdf(
  student: Profile,
  internship: Internship,
  weeklyLogs: WeeklyLog[],
  entries: LogEntry[],
  confirmations: SupervisorConfirmation[],
  verificationToken: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Generate QR code data URL
  const qrUrl = `http://localhost:3000/verify/b2/${verificationToken}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 120 });
  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  // Banner Header
  page.drawText('DON BOSCO COLLEGE OF ENGINEERING', {
    x: 50,
    y: height - 50,
    size: 14,
    font: fontBold,
    color: rgb(0.06, 0.16, 0.35),
  });

  page.drawText(`Department of ${student.department || 'Electronics & Telecommunication'}`, {
    x: 50,
    y: height - 68,
    size: 11,
    font: fontBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('APPENDIX B2: WEEKLY PROGRESS REPORT (COURSE ET740)', {
    x: 50,
    y: height - 85,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.3, 0.6),
  });

  page.drawText('Doc No: DBCE/2021-2022/Ver1.0 | BE Semester VII (8 Weeks)', {
    x: 50,
    y: height - 100,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Embed Verification QR Code in Top Right
  page.drawImage(qrImage, {
    x: width - 130,
    y: height - 120,
    width: 80,
    height: 80,
  });
  page.drawText('Scan to Verify Online', {
    x: width - 135,
    y: height - 130,
    size: 7,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Metadata Grid
  let curY = height - 145;
  page.drawText(`Student Name: ${student.name}`, { x: 50, y: curY, size: 9, font: fontBold });
  page.drawText(`Roll No: ${student.roll_no}`, { x: 300, y: curY, size: 9, font: fontBold });

  curY -= 15;
  page.drawText(`Company: ${internship.company_name}`, { x: 50, y: curY, size: 9, font: fontRegular });
  page.drawText(`Mode: ${internship.mode.toUpperCase()}`, { x: 300, y: curY, size: 9, font: fontRegular });

  curY -= 15;
  page.drawText(`Supervisor: ${internship.supervisor_name} (${internship.supervisor_designation})`, { x: 50, y: curY, size: 9, font: fontRegular });
  page.drawText(`Period: ${internship.start_date} to ${internship.end_date}`, { x: 300, y: curY, size: 9, font: fontRegular });

  curY -= 20;
  page.drawLine({
    start: { x: 50, y: curY },
    end: { x: width - 50, y: curY },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });

  // Table Title
  curY -= 20;
  page.drawText('WEEK-BY-WEEK SUMMARY & SUPERVISOR VERIFICATION', {
    x: 50,
    y: curY,
    size: 10,
    font: fontBold,
    color: rgb(0.06, 0.16, 0.35),
  });

  // Table Headers
  curY -= 18;
  page.drawRectangle({
    x: 50,
    y: curY - 5,
    width: width - 100,
    height: 18,
    color: rgb(0.92, 0.94, 0.97),
  });

  page.drawText('Week', { x: 55, y: curY, size: 8, font: fontBold });
  page.drawText('Date Range', { x: 95, y: curY, size: 8, font: fontBold });
  page.drawText('Work Carried Out / Summary', { x: 210, y: curY, size: 8, font: fontBold });
  page.drawText('Supervisor Signature Status', { x: 410, y: curY, size: 8, font: fontBold });

  // Rows for Weeks 1 to 8
  const sortedWeeks = [...weeklyLogs].sort((a, b) => a.week_no - b.week_no);

  sortedWeeks.forEach((w) => {
    curY -= 28;
    const weekEntries = entries.filter((e) => e.weekly_log_id === w.id);
    const conf = confirmations.find((c) => c.weekly_log_id === w.id);
    const isConfirmed = conf?.status === 'confirmed';

    page.drawText(`W${w.week_no}`, { x: 55, y: curY, size: 8, font: fontBold });
    page.drawText(`${w.week_start} - ${w.week_end}`, { x: 95, y: curY, size: 7, font: fontRegular });

    const summaryText = weekEntries.length > 0
      ? `${weekEntries.length} daily logs filed. ${weekEntries[0].content.slice(0, 50)}...`
      : 'Weekly progress logged.';
    page.drawText(summaryText, { x: 210, y: curY, size: 7, font: fontRegular });

    if (isConfirmed) {
      page.drawText('VERIFIED BY SUPERVISOR', {
        x: 410,
        y: curY + 4,
        size: 7,
        font: fontBold,
        color: rgb(0.1, 0.5, 0.2),
      });
      page.drawText(`[Confirmed: ${conf.confirmed_by_name}]`, {
        x: 410,
        y: curY - 5,
        size: 6,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
    } else {
      page.drawText('Awaiting Verification', {
        x: 410,
        y: curY,
        size: 7,
        font: fontRegular,
        color: rgb(0.6, 0.6, 0.6),
      });
    }

    page.drawLine({
      start: { x: 50, y: curY - 8 },
      end: { x: width - 50, y: curY - 8 },
      thickness: 0.5,
      color: rgb(0.9, 0.9, 0.9),
    });
  });

  // Footer Signatures
  curY -= 40;
  page.drawText('Student Signature', { x: 60, y: curY, size: 8, font: fontBold });
  page.drawText('Internal Faculty Guide', { x: 230, y: curY, size: 8, font: fontBold });
  page.drawText('Industry Supervisor Seal', { x: 420, y: curY, size: 8, font: fontBold });

  return await pdfDoc.save();
}

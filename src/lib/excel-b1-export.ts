import * as XLSX from 'xlsx';
import { Profile, Internship, GuideAssignment } from '@/types/database';

export interface B1ExportConfig {
  collegeName: string;
  department: string;
  dateWindow: string;
  documentNo: string;
  batch: string;
  semester: string;
  courseCode: string;
}

export const defaultB1Config: B1ExportConfig = {
  collegeName: 'DON BOSCO COLLEGE OF ENGINEERING, FATORDA, MARGAO - GOA',
  department: 'Electronics & Telecommunication',
  dateWindow: 'Aug 2024 - Oct 2024',
  documentNo: 'DBCE/2021-2022/Ver1.0',
  batch: '2021-2025',
  semester: 'VII',
  courseCode: 'ET740',
};

export function generateB1Workbook(
  students: Profile[],
  internships: Internship[],
  assignments: GuideAssignment[],
  guides: Profile[],
  config: B1ExportConfig = defaultB1Config
): XLSX.WorkBook {
  const wsData: any[][] = [];

  // Row 1: College Header
  wsData.push([config.collegeName]);
  // Row 2: Department
  wsData.push([`Department of ${config.department}`]);
  // Row 3: Document Title & Date Window
  wsData.push([`Internship Group List (${config.dateWindow})`]);
  // Row 4: Document Metadata
  wsData.push([
    `Doc No: ${config.documentNo}  |  Course: ${config.courseCode}  |  Batch: ${config.batch}  |  Sem: ${config.semester}`,
  ]);
  // Row 5: Blank separator
  wsData.push([]);

  // Row 6: Table Columns
  const headers = [
    'Sr.No',
    'Roll NO',
    'Name of the Student',
    'Email ID',
    'Phone Number',
    'Start Date',
    'End Date',
    'Company Details (Address, E-mail, Phone)',
    'Internal Guide',
    'Signature of Internal Guide',
  ];
  wsData.push(headers);

  // Data Rows
  students.forEach((student, index) => {
    const intern = internships.find((i) => i.student_id === student.id);
    const assign = assignments.find((a) => a.student_id === student.id);
    const guide = guides.find((g) => g.id === assign?.guide_id);

    const companyDetails = intern
      ? `${intern.company_name}, ${intern.address}\nEmail: ${intern.company_email} | Ph: ${intern.company_phone}`
      : 'Not Registered Yet';

    const row = [
      index + 1,
      student.roll_no || 'N/A',
      student.name,
      student.email,
      student.phone || 'N/A',
      intern ? intern.start_date : 'N/A',
      intern ? intern.end_date : 'N/A',
      companyDetails,
      guide ? guide.name : 'Unassigned',
      '', // Blank for physical signature
    ];
    wsData.push(row);
  });

  // Footer Spacing
  wsData.push([]);
  wsData.push([]);

  // Row N + 3: Footer Signatures Block (5 Signatories)
  wsData.push([
    'Internship Coordinator',
    '',
    'Head of Department',
    '',
    'Approved By',
    '',
    'Principal',
    '',
    'Director',
    '',
  ]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column Widths
  ws['!cols'] = [
    { wch: 8 },  // Sr.No
    { wch: 14 }, // Roll No
    { wch: 25 }, // Name
    { wch: 28 }, // Email
    { wch: 15 }, // Phone
    { wch: 14 }, // Start Date
    { wch: 14 }, // End Date
    { wch: 45 }, // Company Details
    { wch: 24 }, // Internal Guide
    { wch: 22 }, // Signature
  ];

  // Cell Merges for header titles
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Row 1 Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Row 2 Dept
    { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } }, // Row 3 Group List
    { s: { r: 3, c: 0 }, e: { r: 3, c: 9 } }, // Row 4 Doc Ref
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Appendix B1 - Group List');

  return wb;
}

export function downloadB1Excel(
  students: Profile[],
  internships: Internship[],
  assignments: GuideAssignment[],
  guides: Profile[],
  config: B1ExportConfig = defaultB1Config
) {
  const wb = generateB1Workbook(students, internships, assignments, guides, config);
  const fileName = `Appendix_B1_Internship_Group_List_${config.batch}_Sem_${config.semester}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

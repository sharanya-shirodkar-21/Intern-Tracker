import {
  Profile,
  Internship,
  WeeklyLog,
  LogEntry,
  GuideAssignment,
  DocumentRecord,
  SupervisorLink,
  SupervisorConfirmation,
  GuideComment,
  GuideContact,
  Deadline,
  Notification,
  AuditLog,
  OutboxEmail,
  ShowcaseProfile,
  AtlasPost,
  StudentMarksEvaluation,
} from '@/types/database';

// Cryptographic SHA-256 helper (browser & node compatible)
export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Basic hash fallback for server initialization
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, 'a');
  }
}

// 1. Initial Coordinator
const initialCoordinator: Profile = {
  id: '11111111-1111-1111-1111-111111111111',
  role: 'coordinator',
  name: 'Dr. Shailesh Khanolkar (Internship Coordinator)',
  email: 'shailesh.khanolkar@dbce.edu',
  phone: '+91 9822100001',
  roll_no: 'COORD-01',
  batch: '2021-2025',
  semester: 'VII',
  department: 'Electronics & Telecommunication',
  created_at: '2024-06-01T00:00:00Z',
};

// 2. Initial 3 Guides
const initialGuides: Profile[] = [
  {
    id: '22222222-2222-2222-2222-222222222201',
    role: 'guide',
    name: 'Dr. Rajesh Sharma',
    email: 'guide.sharma@dbce.edu',
    phone: '+91 9822100002',
    roll_no: 'FAC-01',
    batch: '2021-2025',
    semester: 'VII',
    department: 'Electronics & Telecommunication',
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222202',
    role: 'guide',
    name: 'Prof. Melba Fernandes',
    email: 'guide.fernandes@dbce.edu',
    phone: '+91 9822100003',
    roll_no: 'FAC-02',
    batch: '2021-2025',
    semester: 'VII',
    department: 'Electronics & Telecommunication',
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222203',
    role: 'guide',
    name: 'Prof. Sanket Naik',
    email: 'guide.naik@dbce.edu',
    phone: '+91 9822100004',
    roll_no: 'FAC-03',
    batch: '2021-2025',
    semester: 'VII',
    department: 'Electronics & Telecommunication',
    created_at: '2024-06-01T00:00:00Z',
  },
];

// Seed 30 Students with realistic Goa / Engineering profiles
const studentNames = [
  { name: 'Aarav Vernekar', roll: '21ETC01', email: 'aarav.21etc01@dbce.edu', phone: '9822000001' },
  { name: 'Alisha D\'Souza', roll: '21ETC02', email: 'alisha.21etc02@dbce.edu', phone: '9822000002' },
  { name: 'Aniket Sawant', roll: '21ETC03', email: 'aniket.21etc03@dbce.edu', phone: '9822000003' },
  { name: 'Bhavna Naik', roll: '21ETC04', email: 'bhavna.21etc04@dbce.edu', phone: '9822000004' },
  { name: 'Chetan Gaonkar', roll: '21ETC05', email: 'chetan.21etc05@dbce.edu', phone: '9822000005' },
  { name: 'Damodar Prabhu', roll: '21ETC06', email: 'damodar.21etc06@dbce.edu', phone: '9822000006' },
  { name: 'Disha Dessai', roll: '21ETC07', email: 'disha.21etc07@dbce.edu', phone: '9822000007' },
  { name: 'Elton Rodrigues', roll: '21ETC08', email: 'elton.21etc08@dbce.edu', phone: '9822000008' },
  { name: 'Farhan Shaikh', roll: '21ETC09', email: 'farhan.21etc09@dbce.edu', phone: '9822000009' },
  { name: 'Gauri Borkar', roll: '21ETC10', email: 'gauri.21etc10@dbce.edu', phone: '9822000010' },
  { name: 'Harsh Rane', roll: '21ETC11', email: 'harsh.21etc11@dbce.edu', phone: '9822000011' },
  { name: 'Isha Kulkarni', roll: '21ETC12', email: 'isha.21etc12@dbce.edu', phone: '9822000012' },
  { name: 'Joel Colaco', roll: '21ETC13', email: 'joel.21etc13@dbce.edu', phone: '9822000013' },
  { name: 'Kavya Shenvi', roll: '21ETC14', email: 'kavya.21etc14@dbce.edu', phone: '9822000014' },
  { name: 'Lester Pinto', roll: '21ETC15', email: 'lester.21etc15@dbce.edu', phone: '9822000015' },
  { name: 'Manish Chari', roll: '21ETC16', email: 'manish.21etc16@dbce.edu', phone: '9822000016' },
  { name: 'Neha Mandrekar', roll: '21ETC17', email: 'neha.21etc17@dbce.edu', phone: '9822000017' },
  { name: 'Omkar Shirodkar', roll: '21ETC18', email: 'omkar.21etc18@dbce.edu', phone: '9822000018' },
  { name: 'Pranav Lotlikar', roll: '21ETC19', email: 'pranav.21etc19@dbce.edu', phone: '9822000019' },
  { name: 'Rhea Mascarenhas', roll: '21ETC20', email: 'rhea.21etc20@dbce.edu', phone: '9822000020' },
  { name: 'Sahil Kerkar', roll: '21ETC21', email: 'sahil.21etc21@dbce.edu', phone: '9822000021' },
  { name: 'Tanvi Faldesai', roll: '21ETC22', email: 'tanvi.21etc22@dbce.edu', phone: '9822000022' },
  { name: 'Utkarsh Sinari', roll: '21ETC23', email: 'utkarsh.21etc23@dbce.edu', phone: '9822000023' },
  { name: 'Varun Hegde', roll: '21ETC24', email: 'varun.21etc24@dbce.edu', phone: '9822000024' },
  { name: 'Warren Sequeira', roll: '21ETC25', email: 'warren.21etc25@dbce.edu', phone: '9822000025' },
  { name: 'Yash Khandeparkar', roll: '21ETC26', email: 'yash.21etc26@dbce.edu', phone: '9822000026' },
  { name: 'Zoya Patel', roll: '21ETC27', email: 'zoya.21etc27@dbce.edu', phone: '9822000027' },
  { name: 'Aditya Panandikar', roll: '21ETC28', email: 'aditya.21etc28@dbce.edu', phone: '9822000028' },
  { name: 'Bhavesh Velip', roll: '21ETC29', email: 'bhavesh.21etc29@dbce.edu', phone: '9822000029' },
  { name: 'Chelsea Dias', roll: '21ETC30', email: 'chelsea.21etc30@dbce.edu', phone: '9822000030' },
];

const initialStudents: Profile[] = studentNames.map((s, idx) => ({
  id: `33333333-3333-3333-3333-${(idx + 1).toString().padStart(12, '0')}`,
  role: 'student',
  name: s.name,
  email: s.email,
  phone: s.phone,
  roll_no: s.roll,
  batch: '2021-2025',
  semester: 'VII',
  department: 'Electronics & Telecommunication',
  created_at: '2024-06-05T00:00:00Z',
}));

// Companies for realistic engineering internships
const sampleCompanies = [
  { name: 'Goa Shipyard Limited', address: 'Vasco da Gama, Goa 403802', email: 'training@goashipyard.com', phone: '0832-2512152', domain: 'Embedded Systems & Navigation Electronics', supervisor: 'Cdr. K. V. Rao', desig: 'Chief Engineer (Electronics)' },
  { name: 'Siemens Healthineers', address: 'Plot 31, Verna Industrial Estate, Goa 403722', email: 'hr.goa@siemens.com', phone: '0832-6688000', domain: 'Medical Device Signal Processing', supervisor: 'Mr. Anthony Lobo', desig: 'Principal Systems Architect' },
  { name: 'D-Link India Ltd.', address: 'Plot L-5, Verna Industrial Estate, Goa 403722', email: 'internships@dlink.co.in', phone: '0832-2885800', domain: 'Networking Protocols & Firmware', supervisor: 'Ms. Sunita Salgaonkar', desig: 'Head of Firmware QA' },
  { name: 'Persistent Systems Ltd.', address: 'Verna IT Park, Salcete, Goa 403722', email: 'campus.goa@persistent.com', phone: '0832-6692000', domain: 'Cloud Microservices & Edge AI', supervisor: 'Mr. Rohan Kulkarni', desig: 'Senior Engineering Lead' },
  { name: 'Bosch Automotive Electronics', address: 'Kundaim Industrial Estate, Goa 403115', email: 'careers.kundaim@in.bosch.com', phone: '0832-2395100', domain: 'CAN Bus & Automotive Telematics', supervisor: 'Mr. Pravin Gawas', desig: 'Technical Team Lead' },
  { name: 'Syngenta Bio-Tech IoT Lab', address: 'Corlim, Ilhas, Goa 403110', email: 'iot.corlim@syngenta.com', phone: '0832-2285111', domain: 'Smart Agriculture Sensor Networks', supervisor: 'Dr. Maria D\'Cruz', desig: 'Lead Scientist' },
];

export interface AppState {
  profiles: Profile[];
  guideAssignments: GuideAssignment[];
  internships: Internship[];
  documents: DocumentRecord[];
  weeklyLogs: WeeklyLog[];
  logEntries: LogEntry[];
  supervisorLinks: SupervisorLink[];
  supervisorConfirmations: SupervisorConfirmation[];
  guideComments: GuideComment[];
  guideContacts: GuideContact[];
  deadlines: Deadline[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  outbox: OutboxEmail[];
  showcaseProfiles: ShowcaseProfile[];
  atlasPosts: AtlasPost[];
  studentMarks: StudentMarksEvaluation[];
}

// Function to generate full seed state
export function getInitialSeedState(): AppState {
  const profiles = [initialCoordinator, ...initialGuides, ...initialStudents];
  
  // Distribute initial assignments across the 3 guides (10 each)
  const guideAssignments: GuideAssignment[] = initialStudents.map((s, idx) => ({
    id: `assign-${idx + 1}`,
    student_id: s.id,
    guide_id: initialGuides[idx % 3].id,
    assigned_at: '2024-06-15T10:00:00Z',
  }));

  // Register internships for first 26 students (4 remain unregistered for demonstration)
  const internships: Internship[] = initialStudents.slice(0, 26).map((s, idx) => {
    const comp = sampleCompanies[idx % sampleCompanies.length];
    return {
      id: `intern-${idx + 1}`,
      student_id: s.id,
      company_name: comp.name,
      address: comp.address,
      company_email: comp.email,
      company_phone: comp.phone,
      supervisor_name: comp.supervisor,
      supervisor_designation: comp.desig,
      supervisor_email: `supervisor.${s.roll_no.toLowerCase()}@${comp.email.split('@')[1]}`,
      start_date: '2024-07-01',
      end_date: '2024-08-25',
      mode: idx % 4 === 0 ? 'hybrid' : (idx % 7 === 0 ? 'remote' : 'onsite'),
      domain: comp.domain,
      status: idx < 3 ? 'completed' : (idx < 20 ? 'registered' : 'draft'),
      created_at: '2024-06-20T10:00:00Z',
    };
  });

  // Generate 8 weekly logs per registered internship
  const weeklyLogs: WeeklyLog[] = [];
  const logEntries: LogEntry[] = [];
  const supervisorLinks: SupervisorLink[] = [];
  const supervisorConfirmations: SupervisorConfirmation[] = [];
  const guideComments: GuideComment[] = [];

  internships.forEach((intern, internIdx) => {
    // Generate Weeks 1 to 8
    for (let w = 1; w <= 8; w++) {
      const weekId = `wlog-${internIdx + 1}-${w}`;
      // Calculate 7-day increments starting 2024-07-01
      const startDate = new Date('2024-07-01T00:00:00Z');
      startDate.setUTCDate(startDate.getUTCDate() + (w - 1) * 7);
      const endDate = new Date(startDate);
      endDate.setUTCDate(endDate.getUTCDate() + 6);

      const weekStartStr = startDate.toISOString().split('T')[0];
      const weekEndStr = endDate.toISOString().split('T')[0];

      // Realistic state distribution:
      // intern 0-9: On-track (Weeks 1-4 filled, Weeks 1-2 confirmed)
      // intern 10-14: Behind (Week 1 filled, Week 2 empty, Week 3 empty)
      // intern 15-18: Locked attempt test cases
      // intern 0-2: Completed all 8 weeks
      const isCompletedStudent = internIdx < 3;
      const isOnTrack = internIdx < 10;
      const isBehind = internIdx >= 10 && internIdx < 15;

      let isLocked = false;
      let lockedAt: string | undefined = undefined;

      if (isCompletedStudent) {
        isLocked = true;
        lockedAt = `${weekEndStr}T23:59:59Z`;
      } else if (w <= 2) {
        isLocked = true;
        lockedAt = `${weekEndStr}T23:59:59Z`;
      }

      weeklyLogs.push({
        id: weekId,
        internship_id: intern.id,
        week_no: w,
        week_start: weekStartStr,
        week_end: weekEndStr,
        locked_at: lockedAt,
        prev_hash: w === 1 ? 'GENESIS-0000000000000000000000000000000000000000000000000000000000000000' : `CHAIN-HASH-W${w - 1}`,
        hash: `VERIFIED-HASH-W${w}-${intern.id}`,
        created_at: `${weekStartStr}T09:00:00Z`,
      });

      // Populate entries
      if (isCompletedStudent || (isOnTrack && w <= 3) || (isBehind && w === 1)) {
        for (let day = 0; day < 5; day++) {
          const entryDate = new Date(startDate);
          entryDate.setUTCDate(entryDate.getUTCDate() + day);
          const entryDateStr = entryDate.toISOString().split('T')[0];

          logEntries.push({
            id: `entry-${internIdx + 1}-${w}-${day + 1}`,
            weekly_log_id: weekId,
            entry_date: entryDateStr,
            content: `Conducted detailed testing and firmware analysis for module W${w}D${day + 1}. Utilized oscilloscopes and debuggers to trace signal latency. Documented findings in departmental log.`,
            specificity_score: 85,
            created_at: `${entryDateStr}T17:30:00Z`,
            updated_at: `${entryDateStr}T17:30:00Z`,
          });
        }
      }

      // Add supervisor confirmation for completed/early weeks
      if ((isCompletedStudent && w <= 8) || (isOnTrack && w <= 2)) {
        supervisorConfirmations.push({
          id: `conf-${internIdx + 1}-${w}`,
          weekly_log_id: weekId,
          token_hash: `token-hash-${intern.id}`,
          status: 'confirmed',
          confirmed_by_name: intern.supervisor_name,
          confirmed_at: `${weekEndStr}T20:00:00Z`,
          ip: '157.34.120.4',
          comment: 'Diligent performance. All assigned tasks verified.',
        });
      }

      // Add guide comments
      if (w === 2 && isOnTrack) {
        guideComments.push({
          id: `comment-${internIdx + 1}-${w}`,
          weekly_log_id: weekId,
          guide_id: initialGuides[internIdx % 3].id,
          guide_name: initialGuides[internIdx % 3].name,
          body: 'Good progress on hardware interfacing. Ensure you follow standard ISO documentation formats for your Week 3 report.',
          created_at: `${weekEndStr}T22:00:00Z`,
        });
      }
    }

    // Supervisor secure link per internship
    supervisorLinks.push({
      id: `suplink-${internIdx + 1}`,
      internship_id: intern.id,
      token_hash: `hashed-token-${intern.id}`,
      raw_token: `token-${intern.id}-sec-key`,
      otp_code: '482915',
      otp_expires_at: '2026-12-31T23:59:59Z',
      expires_at: '2026-12-31T23:59:59Z',
      created_at: '2024-07-01T10:00:00Z',
    });
  });

  // Documents
  const documents: DocumentRecord[] = [
    {
      id: 'doc-1',
      internship_id: 'intern-1',
      type: 'offer_letter',
      storage_path: 'documents/intern-1/offer_letter_v1.pdf',
      file_name: 'GoaShipyard_Offer_21ETC01.pdf',
      file_size: 425000,
      mime_type: 'application/pdf',
      version: 1,
      uploaded_at: '2024-06-25T14:30:00Z',
    },
    {
      id: 'doc-2',
      internship_id: 'intern-1',
      type: 'certificate',
      storage_path: 'documents/intern-1/certificate_v1.pdf',
      file_name: 'GSL_Completion_Certificate_Aarav.pdf',
      file_size: 512000,
      mime_type: 'application/pdf',
      version: 1,
      uploaded_at: '2024-08-26T10:00:00Z',
    },
    {
      id: 'doc-3',
      internship_id: 'intern-1',
      type: 'report',
      storage_path: 'documents/intern-1/final_report_v1.pdf',
      file_name: 'Internship_Report_ET740_21ETC01.pdf',
      file_size: 2450000,
      mime_type: 'application/pdf',
      version: 1,
      checks_json: {
        mistakeProoferScore: 94,
        passedChecks: [
          'All required B3 chapters present',
          'Student name and roll no match registration',
          'Company name and guide match records',
          'Dates fall within internship bounds',
          'All 8 weekly summaries included',
          'Page numbers and figure captions detected',
        ],
        warnings: ['Figure 2.3 caption could be more descriptive'],
        failures: [],
      },
      uploaded_at: '2024-08-27T16:00:00Z',
    },
  ];

  // Guide Contacts
  const guideContacts: GuideContact[] = [
    {
      id: 'contact-1',
      internship_id: 'intern-1',
      guide_id: initialGuides[0].id,
      type: 'online',
      contact_date: '2024-07-22',
      with_whom: 'Cdr. K. V. Rao (Chief Engineer)',
      summary: 'Discussed Aarav\'s work on embedded navigation modules. Supervisor expressed high satisfaction with student discipline and technical grounding.',
      outcome: 'Satisfactory. Student recommended to present case study.',
      follow_up_date: '2024-08-15',
      created_at: '2024-07-22T15:00:00Z',
    },
  ];

  // Deadlines
  const deadlines: Deadline[] = [
    {
      id: 'dl-1',
      key: 'offer_letter',
      label: 'Offer Letter Submission',
      rule_json: {
        relativeTo: 'start_date',
        offsetDays: 7,
        description: 'Due within the first week of internship start',
      },
    },
    {
      id: 'dl-2',
      key: 'weekly_log',
      label: 'Weekly Log Filing',
      rule_json: {
        relativeTo: 'week_end',
        offsetDays: 1,
        description: 'Due by Sunday end of week (+24h grace window)',
      },
    },
    {
      id: 'dl-3',
      key: 'final_report',
      label: 'Final Report & Certificate',
      rule_json: {
        relativeTo: 'end_date',
        offsetDays: 15,
        description: 'Due within 15 days of internship completion',
      },
    },
  ];

  // Notifications
  const notifications: Notification[] = [
    {
      id: 'notif-1',
      user_id: initialStudents[0].id,
      title: 'Supervisor Verified Week 2',
      body: 'Cdr. K. V. Rao has verified your Week 2 log entries.',
      link: '/student/weekly-logs',
      created_at: '2024-07-15T10:00:00Z',
    },
    {
      id: 'notif-2',
      user_id: initialStudents[0].id,
      title: 'Guide Feedback on Week 2',
      body: 'Dr. Rajesh Sharma added a comment to your Week 2 log.',
      link: '/student/weekly-logs',
      created_at: '2024-07-15T12:00:00Z',
    },
  ];

  // Outbox
  const outbox: OutboxEmail[] = [
    {
      id: 'mail-1',
      to: 'supervisor.21etc01@goashipyard.com',
      subject: 'InternTrack Verification Link & OTP for Aarav Vernekar (21ETC01)',
      html: '<p>Dear Cdr. K. V. Rao,<br/>Please use the following 6-digit OTP: <b>482915</b> to access and verify weekly logs.</p>',
      sent_at: '2024-07-07T10:00:00Z',
      type: 'otp',
    },
  ];

  // Showcase
  const showcaseProfiles: ShowcaseProfile[] = [
    {
      student_id: initialStudents[0].id,
      is_public: true,
      slug: 'aarav-vernekar-21etc01',
      headline: 'Embedded Systems & Navigation Intern @ Goa Shipyard Limited',
      skills_tags: ['Embedded C', 'CAN Bus', 'Signal Processing', 'ARM Cortex', 'Oscilloscopes', 'Firmware Debugging'],
      visibility_json: {
        company: true,
        domain: true,
        logs: true,
        badges: true,
      },
    },
  ];

  // Atlas Posts
  const atlasPosts: AtlasPost[] = [
    {
      id: 'atlas-1',
      internship_id: 'intern-1',
      company_name: 'Goa Shipyard Limited',
      domain: 'Embedded Systems & Navigation Electronics',
      is_anonymized: true,
      tips: 'Revise C pointers, microcontrollers, and communication protocols (UART, SPI, CAN) before starting. Ask lots of questions to the technical officers.',
      what_i_wish_i_knew: 'Physical reporting is strict at 8:30 AM. Security badges take 2 days to process.',
      how_i_got_it: 'Applied via college Training & Placement cell during the 6th semester campus drive.',
      difficulty_rating: 4,
      overall_rating: 5,
      tags: ['Defense', 'Core Electronics', 'Hardware', 'Stipend Provided'],
      approved_by_coordinator: true,
      created_at: '2024-08-30T10:00:00Z',
    },
    {
      id: 'atlas-2',
      internship_id: 'intern-2',
      company_name: 'Siemens Healthineers',
      domain: 'Medical Device Signal Processing',
      is_anonymized: true,
      tips: 'Brush up on DSP filters (Butterworth, FIR, IIR) and MATLAB / Python signal toolkits. Medical compliance standards (IEC 62304) are key.',
      what_i_wish_i_knew: 'Cleanroom protocols are strictly enforced. Keep a notebook for FDA traceability steps.',
      how_i_got_it: 'Selected via Siemens Hackathon campus round in Sem VI.',
      difficulty_rating: 5,
      overall_rating: 5,
      tags: ['Healthcare', 'Signal Processing', 'R&D', 'MNC'],
      approved_by_coordinator: true,
      created_at: '2024-08-30T10:00:00Z',
    },
    {
      id: 'atlas-3',
      internship_id: 'intern-3',
      company_name: 'D-Link India Ltd.',
      domain: 'Networking Protocols & Firmware',
      is_anonymized: true,
      tips: 'Wireshark packet sniffing and TCP/IP stack knowledge will give you a massive head start. Practice Linux shell scripting.',
      what_i_wish_i_knew: 'Router flashing can brick units if voltages are off. Always double-check baud rates.',
      how_i_got_it: 'Direct application through DBCE alumni network referral.',
      difficulty_rating: 3,
      overall_rating: 5,
      tags: ['Networking', 'Firmware', 'Linux', 'Verna Estate'],
      approved_by_coordinator: true,
      created_at: '2024-08-30T10:00:00Z',
    },
    {
      id: 'atlas-4',
      internship_id: 'intern-4',
      company_name: 'Persistent Systems Ltd.',
      domain: 'Cloud Microservices & Edge AI',
      is_anonymized: true,
      tips: 'Get comfortable with Docker, REST APIs, and Python. Cloud deployments use AWS IoT Core.',
      what_i_wish_i_knew: 'Agile standups occur daily at 10 AM. Document every PR with test cases.',
      how_i_got_it: 'On-campus placement drive coding test.',
      difficulty_rating: 3,
      overall_rating: 4,
      tags: ['Cloud', 'Edge AI', 'Software', 'Hybrid Mode'],
      approved_by_coordinator: true,
      created_at: '2024-08-30T10:00:00Z',
    },
    {
      id: 'atlas-5',
      internship_id: 'intern-5',
      company_name: 'Bosch Automotive Electronics',
      domain: 'CAN Bus & Automotive Telematics',
      is_anonymized: true,
      tips: 'Automotive Ethernet and Vector CANoe tools are heavily used. Understanding ECU architectures is a huge plus.',
      what_i_wish_i_knew: 'Safety SIL ratings are taken very seriously. Test benches run real vehicle simulations.',
      how_i_got_it: 'Faculty recommendation by Prof. Kamat.',
      difficulty_rating: 4,
      overall_rating: 5,
      tags: ['Automotive', 'Embedded C', 'Hardware in Loop', 'Core'],
      approved_by_coordinator: true,
      created_at: '2024-08-30T10:00:00Z',
    },
    {
      id: 'atlas-6',
      internship_id: 'intern-6',
      company_name: 'Syngenta Bio-Tech IoT Lab',
      domain: 'Smart Agriculture Sensor Networks',
      is_anonymized: true,
      tips: 'Great for low-power IoT (LoRaWAN, Zigbee, BLE) and soil moisture / microclimate telemetry sensors.',
      what_i_wish_i_knew: 'Outdoor testing in Corlim farm plots requires battery calibration in heat and rain.',
      how_i_got_it: 'State innovation council summer intern stipend program.',
      difficulty_rating: 2,
      overall_rating: 5,
      tags: ['Agritech', 'LoRaWAN', 'Sensors', 'Field Deployment'],
      approved_by_coordinator: true,
      created_at: '2024-08-30T10:00:00Z',
    },
  ];

  // Continuous Assessment Marks out of 30 for all 30 students
  const studentMarks: StudentMarksEvaluation[] = initialStudents.map((s, idx) => {
    const hasIntern = idx < 26; // 26 registered, 4 unregistered
    const isTop = idx < 6;      // Top 6 students (e.g. Aarav 29/30)
    const isMid = idx >= 6 && idx < 20; // 22-26/30
    const logM = hasIntern ? (isTop ? 10 : isMid ? 8 : 6) : 0;
    const supM = hasIntern ? (isTop ? 10 : isMid ? 8 : 5) : 0;
    const repM = hasIntern ? (isTop ? 9 : isMid ? 8 : 5) : 0;
    return {
      id: `marks-${s.id}`,
      student_id: s.id,
      internship_id: hasIntern ? (internships[idx]?.id || `intern-${idx + 1}`) : '',
      log_regularity_marks: logM,
      supervisor_verification_marks: supM,
      report_quality_marks: repM,
      total_marks: logM + supM + repM,
      graded_by: 'Dr. Rajesh Sharma',
      comments: hasIntern 
        ? (isTop ? 'Exceptional engineering discipline and technical aptitude.' : 'Satisfactory progress across 8 weeks.')
        : 'Internship pending registration.',
      updated_at: '2024-08-30T10:00:00Z',
    };
  });

  return {
    profiles,
    guideAssignments,
    internships,
    documents,
    weeklyLogs,
    logEntries,
    supervisorLinks,
    supervisorConfirmations,
    guideComments,
    guideContacts,
    deadlines,
    notifications,
    auditLogs: [],
    outbox,
    showcaseProfiles,
    atlasPosts,
    studentMarks,
  };
}

// Global Store Manager with reactive local persistence
const STORAGE_KEY = 'INTERNTRACK_STATE_V4';

export class StoreManager {
  private static instance: StoreManager;
  private state: AppState;
  private listeners: (() => void)[] = [];

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): StoreManager {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager();
    }
    return StoreManager.instance;
  }

  private loadState(): AppState {
    const seed = getInitialSeedState();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...seed,
            ...parsed,
            profiles: (parsed.profiles && parsed.profiles.length > 0) ? parsed.profiles : seed.profiles,
            guideAssignments: (parsed.guideAssignments && parsed.guideAssignments.length > 0) ? parsed.guideAssignments : seed.guideAssignments,
            internships: (parsed.internships && parsed.internships.length > 0) ? parsed.internships : seed.internships,
            documents: (parsed.documents && parsed.documents.length > 0) ? parsed.documents : seed.documents,
            weeklyLogs: (parsed.weeklyLogs && parsed.weeklyLogs.length > 0) ? parsed.weeklyLogs : seed.weeklyLogs,
            logEntries: (parsed.logEntries && parsed.logEntries.length > 0) ? parsed.logEntries : seed.logEntries,
            supervisorLinks: (parsed.supervisorLinks && parsed.supervisorLinks.length > 0) ? parsed.supervisorLinks : seed.supervisorLinks,
            supervisorConfirmations: (parsed.supervisorConfirmations && parsed.supervisorConfirmations.length > 0) ? parsed.supervisorConfirmations : seed.supervisorConfirmations,
            guideComments: (parsed.guideComments && parsed.guideComments.length > 0) ? parsed.guideComments : seed.guideComments,
            guideContacts: (parsed.guideContacts && parsed.guideContacts.length > 0) ? parsed.guideContacts : seed.guideContacts,
            deadlines: (parsed.deadlines && parsed.deadlines.length > 0) ? parsed.deadlines : seed.deadlines,
            notifications: parsed.notifications || seed.notifications,
            auditLogs: parsed.auditLogs || seed.auditLogs,
            outbox: parsed.outbox || seed.outbox,
            showcaseProfiles: (parsed.showcaseProfiles && parsed.showcaseProfiles.length > 0) ? parsed.showcaseProfiles : seed.showcaseProfiles,
            atlasPosts: (parsed.atlasPosts && parsed.atlasPosts.length > 0) ? parsed.atlasPosts : seed.atlasPosts,
            studentMarks: (parsed.studentMarks && parsed.studentMarks.length > 0) ? parsed.studentMarks : seed.studentMarks,
          };
        } catch (e) {
          console.error('Failed to parse stored state, falling back to seed', e);
        }
      }
    }
    return seed;
  }

  public saveState(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
    this.notify();
  }

  public resetState(): void {
    this.state = getInitialSeedState();
    this.saveState();
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public notify(): void {
    this.listeners.forEach((l) => l());
  }

  // Action methods
  public addAuditLog(actor: string, action: string, tableName: string, rowId: string, before?: any, after?: any) {
    this.state.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor,
      action,
      table_name: tableName,
      row_id: rowId,
      before_state: before,
      after_state: after,
      ip: '127.0.0.1',
      recorded_at: new Date().toISOString(),
    });
    this.saveState();
  }

  public addOutboxEmail(to: string, subject: string, html: string, type: OutboxEmail['type']) {
    const email: OutboxEmail = {
      id: `mail-${Date.now()}`,
      to,
      subject,
      html,
      sent_at: new Date().toISOString(),
      type,
    };
    this.state.outbox.unshift(email);
    console.log(`[OUTBOX DISPATCH] To: ${to} | Subject: ${subject}`);
    this.saveState();
    return email;
  }

  public addNotification(userId: string, title: string, body: string, link?: string) {
    this.state.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: userId,
      title,
      body,
      link,
      created_at: new Date().toISOString(),
    });
    this.saveState();
  }
}

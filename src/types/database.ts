export type UserRole = 'student' | 'guide' | 'coordinator';
export type InternshipMode = 'onsite' | 'remote' | 'hybrid';
export type InternshipStatus = 'draft' | 'registered' | 'approved' | 'completed';
export type DocumentType = 'offer_letter' | 'certificate' | 'report';
export type ConfirmationStatus = 'pending' | 'confirmed' | 'flagged';
export type ContactType = 'visit' | 'phone' | 'online';

export interface Profile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  roll_no?: string;
  batch: string;
  semester: string;
  department: string;
  created_at: string;
}

export interface GuideAssignment {
  id: string;
  student_id: string;
  guide_id: string;
  assigned_at: string;
}

export interface Internship {
  id: string;
  student_id: string;
  company_name: string;
  address: string;
  company_email: string;
  company_phone: string;
  supervisor_name: string;
  supervisor_designation: string;
  supervisor_email: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  mode: InternshipMode;
  domain: string;
  status: InternshipStatus;
  created_at: string;
}

export interface DocumentRecord {
  id: string;
  internship_id: string;
  type: DocumentType;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  version: number;
  checks_json?: {
    mistakeProoferScore?: number;
    passedChecks?: string[];
    warnings?: string[];
    failures?: string[];
  };
  uploaded_at: string;
}

export interface WeeklyLog {
  id: string;
  internship_id: string;
  week_no: number; // 1 to 8
  week_start: string; // YYYY-MM-DD
  week_end: string;   // YYYY-MM-DD
  locked_at?: string;
  prev_hash?: string;
  hash?: string;
  created_at: string;
}

export interface LogEntry {
  id: string;
  weekly_log_id: string;
  entry_date: string; // YYYY-MM-DD
  content: string;
  specificity_score: number; // 0 to 100
  created_at: string;
  updated_at: string;
}

export interface SupervisorConfirmation {
  id: string;
  weekly_log_id: string;
  token_hash: string;
  status: ConfirmationStatus;
  confirmed_by_name: string;
  confirmed_at: string;
  ip?: string;
  comment?: string;
}

export interface SupervisorLink {
  id: string;
  internship_id: string;
  token_hash: string;
  raw_token: string;
  otp_code?: string;
  otp_expires_at?: string;
  expires_at: string;
  revoked_at?: string;
  created_at: string;
}

export interface GuideComment {
  id: string;
  weekly_log_id: string;
  guide_id: string;
  guide_name: string;
  body: string;
  created_at: string;
}

export interface GuideContact {
  id: string;
  internship_id: string;
  guide_id: string;
  type: ContactType;
  contact_date: string;
  with_whom: string;
  summary: string;
  outcome?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface Deadline {
  id: string;
  key: string;
  label: string;
  rule_json: {
    relativeTo: 'start_date' | 'end_date' | 'week_end';
    offsetDays: number;
    description: string;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  link?: string;
  read_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  table_name: string;
  row_id: string;
  before_state?: any;
  after_state?: any;
  ip?: string;
  recorded_at: string;
}

export interface OutboxEmail {
  id: string;
  to: string;
  subject: string;
  html: string;
  sent_at: string;
  type: 'otp' | 'reminder' | 'comment_notification' | 'supervisor_invite';
}

export interface ShowcaseProfile {
  student_id: string;
  is_public: boolean;
  slug: string;
  headline?: string;
  skills_tags: string[];
  visibility_json: {
    company: boolean;
    domain: boolean;
    logs: boolean;
    badges: boolean;
  };
}

export interface AtlasPost {
  id: string;
  internship_id: string;
  company_name: string;
  domain: string;
  is_anonymized: boolean;
  tips: string;
  what_i_wish_i_knew?: string;
  how_i_got_it?: string;
  difficulty_rating: number; // 1 to 5
  overall_rating: number; // 1 to 5
  tags: string[];
  approved_by_coordinator: boolean;
  created_at: string;
}

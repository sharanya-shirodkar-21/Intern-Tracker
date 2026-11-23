import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Initialize presentation with 16:9 widescreen layout
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Bright, Clean Light Theme Palette
C_BG = RGBColor(248, 250, 252)        # Soft off-white / light slate (#F8FAFC)
C_CARD_BG = RGBColor(255, 255, 255)   # Pure crisp white (#FFFFFF)
C_BORDER = RGBColor(226, 232, 240)    # Soft slate border (#E2E8F0)
C_PRIMARY = RGBColor(30, 64, 175)     # Deep College Blue (#1E40AF)
C_PRIMARY_TINT = RGBColor(239, 246, 255) # Soft Blue Tint (#EFF6FF)
C_TEXT_DARK = RGBColor(15, 23, 42)    # Dark Slate Heading (#0F172A)
C_TEXT_BODY = RGBColor(51, 65, 85)    # Neutral Slate Text (#334155)
C_TEXT_MUTED = RGBColor(100, 116, 139)# Slate Muted (#64748B)

C_TEAL = RGBColor(15, 118, 110)       # Calm Teal (#0F766E)
C_TEAL_TINT = RGBColor(240, 253, 250) # Light Teal Tint (#F0FDFA)
C_ROSE = RGBColor(190, 24, 93)        # Soft Rose (#BE185D)
C_ROSE_TINT = RGBColor(255, 241, 242) # Light Rose Tint (#FFF1F2)
C_AMBER = RGBColor(180, 83, 9)        # Warm Amber (#B45309)
C_AMBER_TINT = RGBColor(254, 252, 232)# Light Amber Tint (#FEFCE8)

def apply_background(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg.fill.solid()
    bg.fill.fore_color.rgb = C_BG
    bg.line.fill.background()
    return bg

def add_header(slide, title_text, subtitle_text):
    # Small Category Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.55), Inches(3.2), Inches(0.32))
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_PRIMARY_TINT
    pill.line.color.rgb = RGBColor(191, 219, 254)
    pill.line.width = Pt(1)
    tf_p = pill.text_frame
    tf_p.word_wrap = True
    p_p = tf_p.paragraphs[0]
    p_p.text = "ET740 • PROBLEM STATEMENT SE3"
    p_p.font.name = 'Arial'
    p_p.font.size = Pt(9.5)
    p_p.font.bold = True
    p_p.font.color.rgb = C_PRIMARY

    # Title & Subtitle Box
    tb = slide.shapes.add_textbox(Inches(1.0), Inches(0.92), Inches(11.333), Inches(0.75))
    tf = tb.text_frame
    tf.word_wrap = True
    
    p1 = tf.paragraphs[0]
    p1.text = title_text
    p1.font.name = 'Arial'
    p1.font.size = Pt(21)
    p1.font.bold = True
    p1.font.color.rgb = C_TEXT_DARK

    p2 = tf.add_paragraph()
    p2.text = subtitle_text
    p2.font.name = 'Arial'
    p2.font.size = Pt(11)
    p2.font.color.rgb = C_TEXT_MUTED
    p2.space_before = Pt(3)

def add_card(slide, left, top, width, height, bg_color=C_CARD_BG, border_color=C_BORDER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1)
    return card

def add_card_header(tf, title, badge=None, accent_color=C_PRIMARY):
    p = tf.paragraphs[0]
    p.space_after = Pt(10)
    
    run_t = p.add_run()
    run_t.text = title
    run_t.font.name = 'Arial'
    run_t.font.size = Pt(13)
    run_t.font.bold = True
    run_t.font.color.rgb = C_TEXT_DARK

    if badge:
        run_b = p.add_run()
        run_b.text = f"  ({badge})"
        run_b.font.name = 'Arial'
        run_b.font.size = Pt(9.5)
        run_b.font.bold = True
        run_b.font.color.rgb = accent_color

def add_bullet(tf, bold_lead, text, bullet_color=C_PRIMARY, space_after=Pt(7)):
    p = tf.add_paragraph()
    p.space_after = space_after
    
    # Dot
    r_dot = p.add_run()
    r_dot.text = "• "
    r_dot.font.name = 'Arial'
    r_dot.font.size = Pt(10.5)
    r_dot.font.bold = True
    r_dot.font.color.rgb = bullet_color

    # Bold lead-in
    r_lead = p.add_run()
    r_lead.text = bold_lead + " "
    r_lead.font.name = 'Arial'
    r_lead.font.size = Pt(10.5)
    r_lead.font.bold = True
    r_lead.font.color.rgb = C_TEXT_DARK

    # Body
    r_body = p.add_run()
    r_body.text = text
    r_body.font.name = 'Arial'
    r_body.font.size = Pt(10.5)
    r_body.font.bold = False
    r_body.font.color.rgb = C_TEXT_BODY

# ==============================================================================
# SLIDE 1: TITLE SLIDE (Clean Light Theme)
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
apply_background(s1)

# Category pill
pill1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.3), Inches(4.5), Inches(0.35))
pill1.fill.solid()
pill1.fill.fore_color.rgb = C_PRIMARY_TINT
pill1.line.color.rgb = RGBColor(191, 219, 254)
p_pill1 = pill1.text_frame.paragraphs[0]
p_pill1.text = "DON BOSCO COLLEGE OF ENGINEERING • COURSE ET740"
p_pill1.font.bold = True
p_pill1.font.size = Pt(9.5)
p_pill1.font.color.rgb = C_PRIMARY

# Main Title & Subtitle Box
tb1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.9), Inches(1.9))
tf1 = tb1.text_frame
tf1.word_wrap = True

p_title = tf1.paragraphs[0]
p_title.text = "InternTrack — Sem VII Internship Portal"
p_title.font.name = 'Arial'
p_title.font.size = Pt(36)
p_title.font.bold = True
p_title.font.color.rgb = C_TEXT_DARK

p_sub = tf1.add_paragraph()
p_sub.text = "Problem Statement SE3 • Electronics & Telecommunication Department"
p_sub.font.name = 'Arial'
p_sub.font.size = Pt(15)
p_sub.font.bold = True
p_sub.font.color.rgb = C_TEAL
p_sub.space_before = Pt(4)

# Simple Overview Card
c1 = add_card(s1, Inches(1.2), Inches(3.9), Inches(10.9), Inches(2.2), bg_color=C_CARD_BG, border_color=C_BORDER)
tf_c1 = c1.text_frame
tf_c1.word_wrap = True
add_card_header(tf_c1, "Simple, Unified Internship Management", "Overview", accent_color=C_PRIMARY)
add_bullet(tf_c1, "One Clean Portal:", "Replaces three separate Excel and Word formats with one web app.", C_PRIMARY, space_after=Pt(8))
add_bullet(tf_c1, "Timely Weekly Progress:", "Stops last-week log back-filling with automatic weekly locks.", C_PRIMARY, space_after=Pt(8))
add_bullet(tf_c1, "Zero-Friction Approvals:", "Industry supervisors verify student work via email link without an account.", C_PRIMARY, space_after=Pt(8))

# Speaker Notes Slide 1
s1.notes_slide.notes_text_frame.text = (
    "Good morning everyone. Today we are presenting InternTrack, built for Problem Statement SE3. "
    "At Don Bosco College of Engineering, Semester VII students complete a mandatory 8-week internship under course ET740. "
    "Currently, students and faculty handle three disconnected files: Appendix B1 for group lists, Appendix B2 for weekly logs, and Appendix B3 for the final report. "
    "InternTrack brings all three formats into a single, clean web portal that stops log back-filling, keeps documents safe, and makes approvals effortless."
)

# ==============================================================================
# SLIDE 2: PROBLEM & SOLUTION
# ==============================================================================
s2 = prs.slides.add_slide(blank_layout)
apply_background(s2)
add_header(s2, "Problem & Solution", "Replacing paper logs and email clutter with a single clean portal.")

w2 = Inches(5.45)
h2 = Inches(4.8)
y2 = Inches(1.9)

# Card 1: Today's Problems (Light Rose Border & Soft Tint)
c_p = add_card(s2, Inches(1.0), y2, w2, h2, bg_color=C_CARD_BG, border_color=RGBColor(251, 207, 232))
tf_p = c_p.text_frame
tf_p.word_wrap = True
add_card_header(tf_p, "⚠️ Today's Problems", "Paper & Excel Clutter", accent_color=C_ROSE)
add_bullet(tf_p, "Last-Minute Logs:", "Students write all 8 weeks in the final week.", C_ROSE, space_after=Pt(12))
add_bullet(tf_p, "Lost Attachments:", "Offer letters and certificates get lost in email inboxes.", C_ROSE, space_after=Pt(12))
add_bullet(tf_p, "Blind Mentorship:", "Faculty guides cannot track student progress week-by-week.", C_ROSE, space_after=Pt(12))
add_bullet(tf_p, "Report Mistakes:", "Common formatting errors delay final report evaluation.", C_ROSE, space_after=Pt(12))

# Card 2: Our Solution (Light Teal Border)
c_s = add_card(s2, Inches(6.88), y2, w2, h2, bg_color=C_CARD_BG, border_color=RGBColor(153, 246, 228))
tf_s = c_s.text_frame
tf_s.word_wrap = True
add_card_header(tf_s, "✅ Our Solution", "InternTrack Portal", accent_color=C_TEAL)
add_bullet(tf_s, "One Unified Portal:", "All logs, documents, and records in one place.", C_TEAL, space_after=Pt(12))
add_bullet(tf_s, "Time-Locked Logs:", "Past weeks lock automatically after a short grace window.", C_TEAL, space_after=Pt(12))
add_bullet(tf_s, "Live Guide Matrix:", "Faculty see student progress at a single glance.", C_TEAL, space_after=Pt(12))
add_bullet(tf_s, "Report Checklist:", "Automated check catches report mistakes before final submission.", C_TEAL, space_after=Pt(12))

# Speaker Notes Slide 2
s2.notes_slide.notes_text_frame.text = (
    "Looking at Slide 2, we contrast current college pain points with InternTrack. "
    "Today, students postpone writing their progress logs until the very end, fabricating 8 weeks in one sitting. "
    "Offer letters and certificates are scattered in faculty email inboxes, guides cannot see what students are doing, "
    "and students submit final reports filled with basic formatting errors. "
    "InternTrack solves all four issues cleanly: one portal for everything, time-locked weekly logs that prevent backfilling, "
    "a live matrix for faculty guides, and an automated pre-submission checklist."
)

# ==============================================================================
# SLIDE 3: WHO USES IT
# ==============================================================================
s3 = prs.slides.add_slide(blank_layout)
apply_background(s3)
add_header(s3, "Who Uses It", "Four key roles designed for smooth coordination without extra accounts.")

w3 = Inches(2.68)
h3 = Inches(4.8)
y3 = Inches(1.9)

# Role 1: Student
c3_1 = add_card(s3, Inches(1.0), y3, w3, h3, bg_color=C_CARD_BG, border_color=C_BORDER)
tf3_1 = c3_1.text_frame
tf3_1.word_wrap = True
add_card_header(tf3_1, "👨‍🎓 Student", "/student", accent_color=C_PRIMARY)
add_bullet(tf3_1, "Register Internship:", "Enter company, dates, and supervisor contact details.", C_PRIMARY, space_after=Pt(10))
add_bullet(tf3_1, "Weekly Logging:", "Submit daily work for Weeks 1 through 8.", C_PRIMARY, space_after=Pt(10))
add_bullet(tf3_1, "Report Checklist:", "Pre-check final report before submitting to guide.", C_PRIMARY, space_after=Pt(10))

# Role 2: Guide
c3_2 = add_card(s3, Inches(3.88), y3, w3, h3, bg_color=C_CARD_BG, border_color=C_BORDER)
tf3_2 = c3_2.text_frame
tf3_2.word_wrap = True
add_card_header(tf3_2, "👩‍🏫 Guide", "/guide", accent_color=C_TEAL)
add_bullet(tf3_2, "Track Progress:", "View assigned mentees on a simple weekly heatmap.", C_TEAL, space_after=Pt(10))
add_bullet(tf3_2, "Guide Feedback:", "Add weekly comments to guide student learning.", C_TEAL, space_after=Pt(10))
add_bullet(tf3_2, "Log Contacts:", "Record industry visits, phone calls, or meetings.", C_TEAL, space_after=Pt(10))

# Role 3: Coordinator
c3_3 = add_card(s3, Inches(6.76), y3, w3, h3, bg_color=C_CARD_BG, border_color=C_BORDER)
tf3_3 = c3_3.text_frame
tf3_3.word_wrap = True
add_card_header(tf3_3, "🏛️ Coordinator", "/coordinator", accent_color=C_PRIMARY)
add_bullet(tf3_3, "Map Guides:", "Auto-balance students evenly across faculty guides.", C_PRIMARY, space_after=Pt(10))
add_bullet(tf3_3, "Monitor Cohort:", "Track who has completed and who needs attention.", C_PRIMARY, space_after=Pt(10))
add_bullet(tf3_3, "Export Group List:", "Download official Appendix B1 Excel roster in seconds.", C_PRIMARY, space_after=Pt(10))

# Role 4: Supervisor
c3_4 = add_card(s3, Inches(9.64), y3, w3, h3, bg_color=C_CARD_BG, border_color=RGBColor(254, 215, 170))
tf3_4 = c3_4.text_frame
tf3_4.word_wrap = True
add_card_header(tf3_4, "🏢 Supervisor", "No Account", accent_color=C_AMBER)
add_bullet(tf3_4, "No Account Needed:", "Open secure link sent directly to work email.", C_AMBER, space_after=Pt(10))
add_bullet(tf3_4, "6-Digit OTP:", "Simple email verification code confirms supervisor identity.", C_AMBER, space_after=Pt(10))
add_bullet(tf3_4, "Confirm Logs:", "1-click verify or leave quick feedback notes.", C_AMBER, space_after=Pt(10))

# Speaker Notes Slide 3
s3.notes_slide.notes_text_frame.text = (
    "Slide 3 shows our four user roles. Each user sees only what matters to them. "
    "Students register their company, write daily entries, and run the report checklist. "
    "Internal guides track their assigned mentees, post comments, and record company visits. "
    "The coordinator auto-balances students across guides and exports the official B1 Group List. "
    "Notice the industry supervisor: they do NOT have to create an account or remember a password. "
    "They receive an expiring email link with a 6-digit OTP, making it fast and easy for busy managers to sign off on weekly logs."
)

# ==============================================================================
# SLIDE 4: KEY FEATURES & RULES
# ==============================================================================
s4 = prs.slides.add_slide(blank_layout)
apply_background(s4)
add_header(s4, "Key Features & Rules", "Sensible rules that keep student progress on schedule and tamper-free.")

w4 = Inches(5.45)
h4 = Inches(4.8)
y4 = Inches(1.9)

# Column 1: Timely Weekly Logs
c4_1 = add_card(s4, Inches(1.0), y4, w4, h4, bg_color=C_CARD_BG, border_color=C_BORDER)
tf4_1 = c4_1.text_frame
tf4_1.word_wrap = True
add_card_header(tf4_1, "⏱️ Timely Weekly Logs", "Anti-Backfill", accent_color=C_PRIMARY)
add_bullet(tf4_1, "Grace Period Lock:", "Weeks lock 24 hours after week ends (lock-engine.ts).", C_PRIMARY, space_after=Pt(12))
add_bullet(tf4_1, "No Back-Filling:", "Future dates and locked weeks cannot be edited.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf4_1, "Integrity Hash Chain:", "Basic SHA-256 chain links each week to the last.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf4_1, "Offline Drafts:", "Save entries offline and sync automatically when reconnected.", C_PRIMARY, space_after=Pt(12))

# Column 2: Smooth Approvals & Reminders
c4_2 = add_card(s4, Inches(6.88), y4, w4, h4, bg_color=C_CARD_BG, border_color=C_BORDER)
tf4_2 = c4_2.text_frame
tf4_2.word_wrap = True
add_card_header(tf4_2, "🔔 Smooth Approvals & Reminders", "Reliable Delivery", accent_color=C_TEAL)
add_bullet(tf4_2, "Supervisor OTP Check:", "Expiring link and 6-digit code prevent forwarded-link abuse.", C_TEAL, space_after=Pt(12))
add_bullet(tf4_2, "Deadline Reminders:", "Automatic alerts for report and certificate due dates.", C_TEAL, space_after=Pt(12))
add_bullet(tf4_2, "Private Mailbox:", "Students only see emails and notices sent to them (/outbox).", C_TEAL, space_after=Pt(12))
add_bullet(tf4_2, "Optional Offer Letter:", "Missing offer letters do not penalize students or marks.", C_TEAL, space_after=Pt(12))

# Speaker Notes Slide 4
s4.notes_slide.notes_text_frame.text = (
    "On Slide 4, we highlight the core feature rules. "
    "First is our anti-backfill lock. A week is editable during its 7 days plus a 24-hour grace window. "
    "After that, the database trigger locks it permanently, making it impossible to back-fill entries at the semester end. "
    "We also store a simple SHA-256 hash chain so coordinators can verify log continuity. "
    "For supervisor approvals, an expiring token and email OTP ensure authenticity without user passwords. "
    "And college deadlines—like submitting reports within 15 days of completion—trigger gentle automated reminders."
)

# ==============================================================================
# SLIDE 5: DBCE FORMATS COVERED (Appendices B1, B2 & B3)
# ==============================================================================
s5 = prs.slides.add_slide(blank_layout)
apply_background(s5)
add_header(s5, "DBCE Formats Covered", "Automating the three official college appendix documents.")

w5 = Inches(3.6)
h5 = Inches(4.8)
y5 = Inches(1.9)

# Col 1: Appendix B1
c5_1 = add_card(s5, Inches(1.0), y5, w5, h5, bg_color=C_CARD_BG, border_color=C_BORDER)
tf5_1 = c5_1.text_frame
tf5_1.word_wrap = True
add_card_header(tf5_1, "📄 Appendix B1", "Group List", accent_color=C_PRIMARY)
add_bullet(tf5_1, "Official Layout:", "Matches DBCE/2021-2022/Ver1.0 layout and header.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf5_1, "Excel Download:", "Exports clean .xlsx spreadsheet with all 9 columns.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf5_1, "Signatory Footers:", "Includes lines for Coordinator, HOD, and Principal.", C_PRIMARY, space_after=Pt(12))

# Col 2: Appendix B2
c5_2 = add_card(s5, Inches(4.86), y5, w5, h5, bg_color=C_CARD_BG, border_color=C_BORDER)
tf5_2 = c5_2.text_frame
tf5_2.word_wrap = True
add_card_header(tf5_2, "📊 Appendix B2", "Weekly Report", accent_color=C_TEAL)
add_bullet(tf5_2, "Clean PDF Export:", "Generates official 8-week progress report using pdf-lib.", C_TEAL, space_after=Pt(12))
add_bullet(tf5_2, "Supervisor Stamps:", "Includes verified stamp with supervisor signature status.", C_TEAL, space_after=Pt(12))
add_bullet(tf5_2, "Authenticity QR:", "Scannable QR code verifies report authenticity online.", C_TEAL, space_after=Pt(12))

# Col 3: Appendix B3
c5_3 = add_card(s5, Inches(8.73), y5, w5, h5, bg_color=C_CARD_BG, border_color=C_BORDER)
tf5_3 = c5_3.text_frame
tf5_3.word_wrap = True
add_card_header(tf5_3, "📑 Appendix B3", "Report Guide", accent_color=C_PRIMARY)
add_bullet(tf5_3, "Pre-Flight Checker:", "Scans student report before final submission.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf5_3, "Format & Details:", "Checks required sections, roll number, and 8 weeks.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf5_3, "Pre-Filled Template:", "Downloadable skeleton structured to official guidelines.", C_PRIMARY, space_after=Pt(12))

# Speaker Notes Slide 5
s5.notes_slide.notes_text_frame.text = (
    "Slide 5 demonstrates our direct alignment with the official Don Bosco College of Engineering documentation. "
    "Appendix B1 is the Group List: our excel-b1-export generator outputs the exact 9-column Excel layout with configurable headers and official signatory lines. "
    "Appendix B2 is the Weekly Progress Report: our b2-pdf generator compiles Weeks 1 through 8 into an authentic PDF with supervisor digital seals and a verification QR code. "
    "Appendix B3 is the Final Report: our mistake-proofer checks that all mandatory sections, certificates, and student details match before allowing upload, saving faculty hours of proofreading."
)

# ==============================================================================
# SLIDE 6: TECH STACK & DEMO FLOW
# ==============================================================================
s6 = prs.slides.add_slide(blank_layout)
apply_background(s6)
add_header(s6, "Tech Stack & Demo Flow", "Modern, reliable web tools powering a simple 4-step workflow.")

w6 = Inches(5.45)
h6 = Inches(4.8)
y6 = Inches(1.9)

# Block 1: Built With
c6_1 = add_card(s6, Inches(1.0), y6, w6, h6, bg_color=C_CARD_BG, border_color=C_BORDER)
tf6_1 = c6_1.text_frame
tf6_1.word_wrap = True
add_card_header(tf6_1, "🛠️ Built With", "Simple & Modern", accent_color=C_PRIMARY)
add_bullet(tf6_1, "Next.js & TypeScript:", "Fast, reliable web portal with clean code architecture.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf6_1, "Tailwind CSS:", "Crisp, responsive layout with light and dark theme support.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf6_1, "Supabase Database:", "PostgreSQL with triggers and row-level security policies.", C_PRIMARY, space_after=Pt(12))
add_bullet(tf6_1, "SheetJS & PDF Tools:", "Creates formatted Excel files and verified PDF reports.", C_PRIMARY, space_after=Pt(12))

# Block 2: Demo Flow
c6_2 = add_card(s6, Inches(6.88), y6, w6, h6, bg_color=C_CARD_BG, border_color=C_BORDER)
tf6_2 = c6_2.text_frame
tf6_2.word_wrap = True
add_card_header(tf6_2, "🚀 Demo Flow", "4-Step Walkthrough", accent_color=C_TEAL)
add_bullet(tf6_2, "1. Coordinator Maps:", "Coordinator imports students and auto-balances guides.", C_TEAL, space_after=Pt(12))
add_bullet(tf6_2, "2. Student Logs Week:", "Student registers company and submits daily logs on time.", C_TEAL, space_after=Pt(12))
add_bullet(tf6_2, "3. Supervisor Verifies:", "Industry supervisor opens secure OTP link and confirms work.", C_TEAL, space_after=Pt(12))
add_bullet(tf6_2, "4. Faculty Evaluates:", "Guide checks progress, grades /30, and exports B1/B2 docs.", C_TEAL, space_after=Pt(12))

# Speaker Notes Slide 6
s6.notes_slide.notes_text_frame.text = (
    "Finally, on Slide 6, we summarize our technology stack and demo walkthrough. "
    "We chose Next.js 14, TypeScript, Tailwind CSS, and Supabase PostgreSQL—industry-standard tools that build cleanly and run with zero external friction. "
    "Our demo flow follows the exact student journey: coordinator maps students, student logs weekly progress, industry supervisor confirms with email OTP, "
    "and faculty evaluate marks out of 30 and export official B1 and B2 records. "
    "InternTrack is fully functional, verified by unit tests, and ready for use in Course ET740. Thank you!"
)

# Output Presentation Path
output_file = os.path.join(os.getcwd(), "InternTrack_SE3_Simple.pptx")
prs.save(output_file)
print(f"SUCCESS: Saved clean presentation to {output_file}")
print(f"Slide count: {len(prs.slides)}")

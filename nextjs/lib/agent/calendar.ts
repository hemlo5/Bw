// CBSE Exam Calendar + Smart Trigger Logic
// Determines what content to auto-publish based on exam proximity

export interface CalendarEvent {
    examName: string
    subject: string
    category: 'Class 10' | 'Class 12'
    date: Date          // exam date
    daysUntil: number   // computed at runtime
}

export interface PublishTrigger {
    title: string
    slug: string
    type: string
    category: string
    subject: string
    reason: string       // e.g. "7 days before CBSE Class 10 Science exam"
}

// ── CBSE 2026 Exam Dates ──────────────────────────────────────────────────────
// Update these each year from: cbse.gov.in/Ptr_temp.aspx?page=TimeTable
const CBSE_EXAMS: Array<{ subject: string; category: 'Class 10' | 'Class 12'; date: string }> = [
    // ── Class 10 (Feb–Mar 2026, most exams post-Feb 15) ──
    { subject: 'English', category: 'Class 10', date: '2026-03-10' },
    { subject: 'Hindi', category: 'Class 10', date: '2026-03-14' },
    { subject: 'Science', category: 'Class 10', date: '2026-03-18' },
    { subject: 'Social Science', category: 'Class 10', date: '2026-03-20' },
    { subject: 'Maths', category: 'Class 10', date: '2026-03-25' },
    // ── Class 12 (Feb–Apr 2026) ──
    { subject: 'English', category: 'Class 12', date: '2026-03-11' },
    { subject: 'Physics', category: 'Class 12', date: '2026-03-16' },
    { subject: 'Chemistry', category: 'Class 12', date: '2026-03-19' },
    { subject: 'Mathematics', category: 'Class 12', date: '2026-03-23' },
    { subject: 'Biology', category: 'Class 12', date: '2026-03-26' },
    { subject: 'History', category: 'Class 12', date: '2026-03-13' },
    { subject: 'Economics', category: 'Class 12', date: '2026-03-17' },
    { subject: 'Accountancy', category: 'Class 12', date: '2026-03-24' },
    { subject: 'Computer Science', category: 'Class 12', date: '2026-04-01' },
]

function slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ── Determine what to publish today ──────────────────────────────────────────
export function getCalendarTriggers(today: Date = new Date()): PublishTrigger[] {
    const triggers: PublishTrigger[] = []
    const todayMs = today.getTime()

    for (const exam of CBSE_EXAMS) {
        const examDate = new Date(exam.date)
        const diffMs = examDate.getTime() - todayMs
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
        const classNum = exam.category === 'Class 10' ? '10' : '12'
        const catSlug = `class-${classNum}`
        const subSlug = slugify(exam.subject)
        const year = examDate.getFullYear()

        // 30 days before → Study Material
        if (diffDays === 30) {
            triggers.push({
                title: `CBSE ${exam.category} ${exam.subject} Study Material ${year} — Complete Notes & Key Concepts`,
                slug: `cbse-class-${classNum}-${subSlug}-study-material-${year}`,
                type: 'Study Material', category: exam.category, subject: exam.subject,
                reason: `30 days before CBSE ${exam.category} ${exam.subject} exam`,
            })
        }
        // 14 days before → Important Questions
        if (diffDays === 14) {
            triggers.push({
                title: `CBSE ${exam.category} ${exam.subject} Important Questions ${year} — Board Exam Expected Topics`,
                slug: `cbse-class-${classNum}-${subSlug}-important-questions-${year}`,
                type: 'Important Questions', category: exam.category, subject: exam.subject,
                reason: `14 days before CBSE ${exam.category} ${exam.subject} exam`,
            })
        }
        // 7 days before → Quick Revision + Tips
        if (diffDays === 7) {
            triggers.push({
                title: `CBSE ${exam.category} ${exam.subject} Quick Revision Notes ${year} — Last 7 Days Strategy`,
                slug: `cbse-class-${classNum}-${subSlug}-quick-revision-${year}`,
                type: 'Study Material', category: exam.category, subject: exam.subject,
                reason: `7 days before CBSE ${exam.category} ${exam.subject} exam`,
            })
        }
        // 1 day before → Last Minute Tips
        if (diffDays === 1) {
            triggers.push({
                title: `CBSE ${exam.category} ${exam.subject} Last Minute Tips ${year} — Exam Day Checklist`,
                slug: `cbse-class-${classNum}-${subSlug}-last-minute-tips-${year}`,
                type: 'Study Material', category: exam.category, subject: exam.subject,
                reason: `1 day before CBSE ${exam.category} ${exam.subject} exam`,
            })
        }
        // Day after → Answer Key
        if (diffDays === -1) {
            triggers.push({
                title: `CBSE ${exam.category} ${exam.subject} Answer Key ${year} — Official Solutions & Analysis`,
                slug: `cbse-class-${classNum}-${subSlug}-answer-key-${year}`,
                type: 'Answer Key', category: exam.category, subject: exam.subject,
                reason: `Day after CBSE ${exam.category} ${exam.subject} exam`,
            })
        }
    }

    return triggers
}

// Get upcoming exams for admin dashboard preview
export function getUpcomingExams(days = 14): CalendarEvent[] {
    const today = new Date()
    return CBSE_EXAMS
        .map((e: { subject: string; category: 'Class 10' | 'Class 12'; date: string }) => {
            const date = new Date(e.date)
            const daysUntil = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            return { examName: `CBSE ${e.category} ${e.subject}`, subject: e.subject, category: e.category, date, daysUntil }
        })
        .filter((e: { daysUntil: number }) => e.daysUntil >= 0 && e.daysUntil <= days)
        .sort((a: { daysUntil: number }, b: { daysUntil: number }) => a.daysUntil - b.daysUntil)
}

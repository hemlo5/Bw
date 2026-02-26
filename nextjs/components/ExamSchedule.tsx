'use client'

import { useEffect, useRef } from 'react'
import type { ExamSchedule } from '@/lib/supabase'

interface ExamScheduleBoxProps {
  title: string
  classNum: string
  exams: ExamSchedule[]
}

function isToday(dateStr: string): boolean {
  try {
    const examDate = new Date(dateStr)
    const today = new Date()
    return (
      examDate.getUTCDate() === today.getDate() &&
      examDate.getUTCMonth() === today.getMonth() &&
      examDate.getUTCFullYear() === today.getFullYear()
    )
  } catch {
    return false
  }
}

function formatDate(dateStr: string): { day: string; month: string } {
  try {
    const d = new Date(dateStr)
    return {
      day: String(d.getUTCDate()),
      month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
    }
  } catch {
    return { day: '?', month: '???' }
  }
}

export function ExamScheduleBox({ title, classNum, exams }: ExamScheduleBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    // Scroll to today's exam or first future exam
    const today = new Date()
    const rows = container.querySelectorAll<HTMLElement>('[data-exam-date]')

    let scrollTarget: HTMLElement | null = null

    for (const row of Array.from(rows)) {
      const d = new Date(row.dataset.examDate || '')
      if (
        d.getUTCFullYear() === today.getFullYear() &&
        d.getUTCMonth() === today.getMonth() &&
        d.getUTCDate() === today.getDate()
      ) {
        scrollTarget = row
        break
      }
      if (d >= today && !scrollTarget) {
        scrollTarget = row
      }
    }

    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [])

  if (!exams || exams.length === 0) {
    return (
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
            {classNum}
          </span>
          {title}
        </h3>
        <p className="text-sm text-gray-400 text-center py-4">No schedule available yet.</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
          {classNum}
        </span>
        {title}
      </h3>

      <div
        ref={scrollRef}
        className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1"
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
        }}
      >
        {exams.map((exam) => {
          const today = isToday(exam.exam_date)
          const { day, month } = formatDate(exam.exam_date)

          return (
            <div
              key={exam.id}
              data-exam-date={exam.exam_date}
              className={`flex gap-3 p-2 rounded-lg transition-colors ${today
                  ? 'bg-sky-50 border-2 border-sky-200'
                  : 'hover:bg-gray-50 border-2 border-transparent'
                }`}
            >
              {/* Date box */}
              <div
                className={`flex flex-col items-center justify-center rounded p-1 min-w-[50px] ${today ? 'bg-sky-100' : 'bg-gray-100'
                  }`}
              >
                <span className={`text-xs font-bold ${today ? 'text-sky-600' : 'text-gray-500'}`}>
                  {month}
                </span>
                <span
                  className={`text-lg font-bold leading-tight ${today ? 'text-sky-700' : 'text-gray-900'
                    }`}
                >
                  {day}
                </span>
              </div>

              {/* Subject + time */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p
                  className={`font-bold text-sm leading-tight ${today ? 'text-sky-900' : 'text-gray-900'
                    }`}
                >
                  {exam.subject}
                </p>
                <p className={`text-xs mt-0.5 ${today ? 'text-sky-600 font-semibold' : 'text-gray-400'}`}>
                  {today ? 'TODAY • ' : ''}
                  {exam.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

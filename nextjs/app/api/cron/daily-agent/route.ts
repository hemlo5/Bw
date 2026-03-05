// HTTP trigger for the daily agent — used by admin panel "Run Now" button
// Protected by CRON_SECRET

import { NextRequest, NextResponse } from 'next/server'
import { runDailyAgent, getLastRunLog } from '../../../../lib/agent/agent'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET(req: NextRequest) {
    // Return last run log
    const auth = req.headers.get('authorization')
    const secret = process.env.CRON_SECRET
    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ log: getLastRunLog() })
}

export async function POST(req: NextRequest) {
    const auth = req.headers.get('authorization')
    const secret = process.env.CRON_SECRET
    if (!secret || auth !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const maxArticles = body.maxArticles ?? 5

    try {
        const log = await runDailyAgent(maxArticles)
        return NextResponse.json({ ok: true, log })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

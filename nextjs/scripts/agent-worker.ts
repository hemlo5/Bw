// Agent Worker — started by instrumentation.ts on server boot
// Uses node-cron to schedule the daily agent run at 6 AM IST

import cron from 'node-cron'
import { runDailyAgent } from '../lib/agent/agent'

let initialized = false

export function startAgentWorker() {
    if (initialized) return
    initialized = true

    console.log('[AgentWorker] Starting — daily run scheduled at 6:00 AM IST')

    // 6 AM IST = 00:30 UTC  (IST = UTC+5:30)
    cron.schedule('30 0 * * *', async () => {
        console.log('[AgentWorker] ⏰ Cron fired — running daily agent...')
        try {
            const log = await runDailyAgent(5)
            console.log(`[AgentWorker] ✅ Done. Published ${log.totalArticles} articles.`)
        } catch (e: any) {
            console.error('[AgentWorker] ❌ Agent run failed:', e.message)
        }
    }, { timezone: 'Asia/Kolkata' })
}

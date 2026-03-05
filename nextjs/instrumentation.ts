// Next.js 14 Instrumentation Hook — runs once on server startup
// Starts the node-cron agent worker so it runs on Railway 24/7

export async function register() {
    // Only run in Node.js runtime (not Edge)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { startAgentWorker } = await import('./scripts/agent-worker')
        startAgentWorker()
    }
}

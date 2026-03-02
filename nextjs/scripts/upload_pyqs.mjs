// CBSE Class 10 PYQ Upload Script
// Run with: node scripts/upload_pyqs.mjs
// Make sure 'pyqs' public bucket exists in Supabase Storage first!

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'

const SUPABASE_URL = 'https://vlvwakjwpjxkkgpyprzx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdndha2p3cGp4a2tncHlwcnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTk3MDMsImV4cCI6MjA4NzU5NTcwM30.wEc6qFqn44g9tCVPnxOGYI1H-LwylmZOr0hAxW5dqiM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PYQ_DIR = 'C:/Users/amrut/OneDrive/Desktop/10pyq'
const TEMP_DIR = 'C:/Users/amrut/OneDrive/Desktop/10pyq_extracted'
const BUCKET = 'pyqs'

// ── Subject name cleanup ──────────────────────────────────────────────────────
function folderToSubject(folderName) {
    // "086_Science" → { code: "086", name: "Science", slug: "science" }
    const m = folderName.match(/^(\d+)_(.+)$/)
    if (!m) return null
    const name = m[2].replace(/_/g, ' ').replace(/\s+NEW$/i, '').trim()
    return { code: m[1], name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
}

function pdfToSubject(filename) {
    // "101_Apparel_H_E.pdf" → { code: "101", name: "Apparel", slug: "apparel" }
    const base = filename.replace('.pdf', '')
    const m = base.match(/^(\d+)_(.+)$/)
    if (!m) return null
    let name = m[2].replace(/_/g, ' ')
        .replace(/\bH E\b/g, '(H/E)').replace(/\bE H\b/g, '(E/H)')
        .replace(/\bNEW\s*$/i, '').trim()
    return { code: m[1], name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
}

function parseSetFromFilename(filename) {
    // "30-1-1_Mathematics Standard.pdf" → zone:1, set:1
    // "30 B_Maths Std for Visually Impaired.pdf" → isVI:true
    const isVI = /visually.impaired/i.test(filename)
    if (isVI) return { zone: null, set: null, isVI: true, label: '♿ Visually Impaired' }
    const m = filename.match(/^\d+-(\d+)-(\d+)_/)
    if (m) {
        const zone = parseInt(m[1])
        const set = parseInt(m[2])
        const series = ['Delhi', 'Outside Delhi', 'Outside Delhi (Abroad)', 'Compartment 1', 'Compartment 2', 'Compartment (Abroad)']
        const seriesLabel = series[zone - 1] || `Series ${zone}`
        return { zone, set, isVI: false, label: `${seriesLabel} · Set ${set}` }
    }
    return { zone: null, set: null, isVI: false, label: 'Main Paper' }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
    console.log('🚀 CBSE Class 10 PYQ Upload Starting...\n')

    // 1. Create temp dir
    if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true })
    mkdirSync(TEMP_DIR, { recursive: true })

    // 2. Extract all ZIP files
    const allFiles = readdirSync(PYQ_DIR)
    const zips = allFiles.filter(f => f.endsWith('.zip'))
    const pdfs = allFiles.filter(f => f.endsWith('.pdf'))

    console.log(`📦 Extracting ${zips.length} ZIP files...`)
    for (const zip of zips) {
        const zipPath = join(PYQ_DIR, zip).replace(/\//g, '\\')
        const destPath = TEMP_DIR.replace(/\//g, '\\')
        console.log(`  Extracting: ${zip}`)
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destPath}' -Force"`, { stdio: 'inherit' })
    }
    console.log('✅ Extraction complete\n')

    // 3. Collect all files to upload
    const queue = []

    // Individual root PDFs (single-paper subjects)
    for (const pdf of pdfs) {
        const subject = pdfToSubject(pdf)
        if (!subject) continue
        queue.push({
            localPath: join(PYQ_DIR, pdf),
            storagePath: `class-10/${subject.slug}/${pdf}`,
            subject: subject.name,
            subjectCode: subject.code,
            subjectSlug: subject.slug,
            setLabel: 'Single Paper',
            zone: null,
            set: null,
            isVI: false,
        })
    }

    // Multi-set papers from extracted ZIPs
    const extractedFolders = readdirSync(TEMP_DIR)
        .filter(f => statSync(join(TEMP_DIR, f)).isDirectory())

    for (const folder of extractedFolders) {
        const subject = folderToSubject(folder)
        if (!subject) continue
        const folderPdfs = readdirSync(join(TEMP_DIR, folder))
            .filter(f => f.endsWith('.pdf'))
            .sort()

        for (const pdf of folderPdfs) {
            const setInfo = parseSetFromFilename(pdf)
            queue.push({
                localPath: join(TEMP_DIR, folder, pdf),
                storagePath: `class-10/${subject.slug}/${pdf}`,
                subject: subject.name,
                subjectCode: subject.code,
                subjectSlug: subject.slug,
                setLabel: setInfo.label,
                zone: setInfo.zone,
                set: setInfo.set,
                isVI: setInfo.isVI,
            })
        }
    }

    console.log(`📄 Found ${queue.length} PDFs to upload\n`)

    // 4. Upload each file
    let success = 0, failed = 0
    for (let i = 0; i < queue.length; i++) {
        const item = queue[i]
        process.stdout.write(`[${i + 1}/${queue.length}] ${item.subject} — ${item.setLabel} ... `)

        try {
            const fileContent = readFileSync(item.localPath)
            const { error: uploadErr } = await supabase.storage
                .from(BUCKET)
                .upload(item.storagePath, fileContent, {
                    contentType: 'application/pdf',
                    upsert: true,
                })

            if (uploadErr) throw new Error(uploadErr.message)

            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${item.storagePath}`

            const { error: dbErr } = await supabase.from('pyq_papers').upsert({
                class: 'Class 10',
                subject: item.subject,
                subject_code: item.subjectCode,
                subject_slug: item.subjectSlug,
                paper_name: basename(item.localPath, '.pdf'),
                set_label: item.setLabel,
                zone_number: item.zone,
                set_number: item.set,
                storage_path: item.storagePath,
                public_url: publicUrl,
                is_visually_impaired: item.isVI,
            }, { onConflict: 'storage_path' })

            if (dbErr) throw new Error(`DB: ${dbErr.message}`)

            console.log('✅')
            success++
        } catch (err) {
            console.log(`❌ ${err.message}`)
            failed++
        }
    }

    // 5. Cleanup
    console.log('\n🧹 Cleaning up temp files...')
    rmSync(TEMP_DIR, { recursive: true, force: true })

    console.log(`\n🎉 Upload complete! ✅ ${success} succeeded, ❌ ${failed} failed`)
    console.log('\nYour PYQ page will now show all papers at: /class-10/pyq/')
}

run().catch(err => { console.error('Fatal error:', err); process.exit(1) })

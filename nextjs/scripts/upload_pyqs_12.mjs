// CBSE Class 12 PYQ Upload Script
// Run with: node scripts/upload_pyqs_12.mjs
// Uploads ZIPs (main subjects) + loose PDFs (minor subjects) to Supabase

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync } from 'fs'
import { join, basename } from 'path'
import { execSync } from 'child_process'

const SUPABASE_URL = 'https://vlvwakjwpjxkkgpyprzx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsdndha2p3cGp4a2tncHlwcnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMTk3MDMsImV4cCI6MjA4NzU5NTcwM30.wEc6qFqn44g9tCVPnxOGYI1H-LwylmZOr0hAxW5dqiM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const PYQ_DIR = 'C:/Users/amrut/OneDrive/Desktop/12pyq'
const TEMP_DIR = 'C:/Users/amrut/OneDrive/Desktop/12pyq_extracted'
const BUCKET = 'pyqs'

// ── Name parsers ──────────────────────────────────────────────────────────────

// ZIP files: "PHYSICS.zip" / "ENGLISH_CORE.zip" / "English_Elective.zip"
function zipToSubject(zipName) {
    const base = zipName.replace('.zip', '')
    const name = base.replace(/_/g, ' ')
        .replace(/\bCORE\b/gi, 'Core')
        .replace(/\bELECTIVE\b/gi, 'Elective')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
        .trim()
    const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return { name, slug }
}

// Loose PDFs: "91_COMPUTER_SCIENCE.pdf" / "75_Physical Education.pdf"
function pdfToSubject(filename) {
    const base = filename.replace('.pdf', '')
    const m = base.match(/^(\d+)_(.+)$/)
    if (!m) return null
    let name = m[2].replace(/_/g, ' ').replace(/\bNEW\s*$/i, '').trim()
    // Title-case
    name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return { code: m[1], name, slug }
}

// PYQ paper set label from filename: "30-1-1_Physics.pdf" → "Delhi · Set 1"
function parseSetFromFilename(filename) {
    const isVI = /visually.impaired/i.test(filename)
    if (isVI) return { zone: null, set: null, isVI: true, label: '♿ Visually Impaired' }
    const m = filename.match(/^(\d+)-(\d+)-(\d+)[_\s]/)
    if (m) {
        const zone = parseInt(m[2])
        const set = parseInt(m[3])
        const series = ['Delhi', 'Outside Delhi', 'Outside Delhi (Abroad)', 'Compartment 1', 'Compartment 2', 'Compartment (Abroad)']
        return { zone, set, isVI: false, label: `${series[zone - 1] || `Series ${zone}`} · Set ${set}` }
    }
    return { zone: null, set: null, isVI: false, label: 'Main Paper' }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
    console.log('🚀 CBSE Class 12 PYQ Upload Starting...\n')

    // 1. Create temp dir
    if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true })
    mkdirSync(TEMP_DIR, { recursive: true })

    const allFiles = readdirSync(PYQ_DIR)
    const zips = allFiles.filter(f => f.endsWith('.zip'))
    const pdfs = allFiles.filter(f => f.endsWith('.pdf'))

    console.log(`📦 Found ${zips.length} ZIP files (main subjects) and ${pdfs.length} loose PDFs (minor subjects)`)

    // 2. Extract all ZIP files
    console.log(`\n📦 Extracting ZIPs...`)
    for (const zip of zips) {
        const zipPath = join(PYQ_DIR, zip).replace(/\//g, '\\')
        const destPath = TEMP_DIR.replace(/\//g, '\\')
        console.log(`  Extracting: ${zip}`)
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destPath}' -Force"`, { stdio: 'inherit' })
    }
    console.log('✅ Extraction complete\n')

    const queue = []

    // 3a. Loose PDFs (single paper minor subjects)
    for (const pdf of pdfs) {
        const subject = pdfToSubject(pdf)
        if (!subject) continue
        queue.push({
            localPath: join(PYQ_DIR, pdf),
            storagePath: `class-12/${subject.slug}/${pdf}`,
            subject: subject.name,
            subjectCode: subject.code,
            subjectSlug: subject.slug,
            setLabel: 'Single Paper',
            zone: null, set: null, isVI: false,
        })
    }

    // 3b. Main subject ZIPs (multiple sets per subject)
    const extractedEntries = readdirSync(TEMP_DIR)
    for (const entry of extractedEntries) {
        const entryPath = join(TEMP_DIR, entry)
        if (!statSync(entryPath).isDirectory()) continue

        const subject = zipToSubject(entry + '.zip')  // treat folder name same as zip
        const folderPdfs = readdirSync(entryPath).filter(f => f.endsWith('.pdf')).sort()

        for (const pdf of folderPdfs) {
            const setInfo = parseSetFromFilename(pdf)
            queue.push({
                localPath: join(entryPath, pdf),
                storagePath: `class-12/${subject.slug}/${pdf}`,
                subject: subject.name,
                subjectCode: null,
                subjectSlug: subject.slug,
                setLabel: setInfo.label,
                zone: setInfo.zone, set: setInfo.set, isVI: setInfo.isVI,
            })
        }
    }

    console.log(`📄 Total PDFs to upload: ${queue.length}\n`)

    // 4. Upload + DB insert
    let success = 0, failed = 0
    for (let i = 0; i < queue.length; i++) {
        const item = queue[i]
        process.stdout.write(`[${i + 1}/${queue.length}] ${item.subject} — ${item.setLabel} ... `)

        try {
            const fileContent = readFileSync(item.localPath)

            const { error: uploadErr } = await supabase.storage
                .from(BUCKET)
                .upload(item.storagePath, fileContent, { contentType: 'application/pdf', upsert: true })
            if (uploadErr) throw new Error(uploadErr.message)

            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${item.storagePath}`

            const { error: dbErr } = await supabase.from('pyq_papers').upsert({
                class: 'Class 12',
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

    console.log(`\n🎉 Done! ✅ ${success} uploaded, ❌ ${failed} failed`)
    console.log('PYQs now live at: /class-12/pyq/')
}

run().catch(err => { console.error('Fatal error:', err); process.exit(1) })

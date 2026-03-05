import { createClient } from '@supabase/supabase-js'
import Layout from '@/components/Layout'
import PYQGrid from '@/components/PYQGrid'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'CBSE Class 12 Previous Year Question Papers 2024 - Free PDF Download | BoardsWallah',
    description: 'Download CBSE Class 12 Previous Year Question Papers (PYQ) 2024 for all subjects — Physics, Chemistry, Biology, Mathematics, Accountancy, Economics, English, Hindi and more. All sets and series. Free PDF.',
    keywords: 'CBSE Class 12 Previous Year Question Papers, Class 12 PYQ, CBSE 12th Board Question Papers, Class 12 Board Exam Papers PDF, CBSE Class 12 Physics Question Paper, CBSE Class 12 Maths Paper 2024',
    alternates: {
        canonical: 'https://boardswallah.com/cbse-class-12-previous-year-question-papers/',
    },
    openGraph: {
        title: 'CBSE Class 12 Previous Year Question Papers 2024 - Free PDF | BoardsWallah',
        description: 'All CBSE Class 12 board exam question papers — Physics, Chemistry, Maths, Biology, English, Hindi and more. Free PDF download, all sets included.',
        url: 'https://boardswallah.com/cbse-class-12-previous-year-question-papers/',
        type: 'website',
    },
}

export const revalidate = 86400

async function getPYQPapers() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
        .from('pyq_papers')
        .select('id, subject, subject_slug, subject_code, set_label, zone_number, set_number, is_visually_impaired, public_url, paper_name')
        .eq('class', 'Class 12')
        .order('subject', { ascending: true })
        .order('zone_number', { ascending: true, nullsFirst: false })
        .order('set_number', { ascending: true, nullsFirst: false })
    return data || []
}

export default async function CBSEClass12PYQPage() {
    const papers = await getPYQPapers()
    return (
        <Layout>
            <PYQGrid papers={papers} classLevel="12" />
        </Layout>
    )
}

import { redirect } from 'next/navigation'

// 301 redirect old /class-10/pyq/ → new SEO URL
export default function OldPYQRoute() {
    redirect('/cbse-class-10-previous-year-question-papers/')
}

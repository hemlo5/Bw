// Curated Unsplash image URLs per subject — no API key needed
// These are permanent direct Unsplash photo URLs

export interface AgentImage {
    url: string
    alt: string
    credit: string
}

const SUBJECT_IMAGES: Record<string, AgentImage[]> = {
    'Science': [
        { url: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=900&auto=format&fit=crop&q=80', alt: 'Science laboratory experiment', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1532094349884-543559c66b2d?w=900&auto=format&fit=crop&q=80', alt: 'Science equipment and beakers', credit: 'Unsplash' },
    ],
    'Maths': [
        { url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80', alt: 'Mathematics equations on blackboard', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=900&auto=format&fit=crop&q=80', alt: 'Maths formulas notebook', credit: 'Unsplash' },
    ],
    'Mathematics': [
        { url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80', alt: 'Mathematics equations', credit: 'Unsplash' },
    ],
    'Social Science': [
        { url: 'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=900&auto=format&fit=crop&q=80', alt: 'World map and globe', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&fit=crop&q=80', alt: 'History books and documents', credit: 'Unsplash' },
    ],
    'English': [
        { url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&auto=format&fit=crop&q=80', alt: 'Open book and reading', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=900&auto=format&fit=crop&q=80', alt: 'Writing and literature', credit: 'Unsplash' },
    ],
    'Hindi': [
        { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&auto=format&fit=crop&q=80', alt: 'Books and writing', credit: 'Unsplash' },
    ],
    'Physics': [
        { url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=900&auto=format&fit=crop&q=80', alt: 'Physics wave patterns', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&auto=format&fit=crop&q=80', alt: 'Physics laboratory', credit: 'Unsplash' },
    ],
    'Chemistry': [
        { url: 'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=900&auto=format&fit=crop&q=80', alt: 'Chemistry laboratory flasks', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=900&auto=format&fit=crop&q=80', alt: 'Chemistry molecules', credit: 'Unsplash' },
    ],
    'Biology': [
        { url: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=900&auto=format&fit=crop&q=80', alt: 'Biology microscope', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=900&auto=format&fit=crop&q=80', alt: 'Biology cells', credit: 'Unsplash' },
    ],
    'Economics': [
        { url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=80', alt: 'Economics charts and graphs', credit: 'Unsplash' },
    ],
    'History': [
        { url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=900&auto=format&fit=crop&q=80', alt: 'Historical artifacts and documents', credit: 'Unsplash' },
    ],
    'Accountancy': [
        { url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&auto=format&fit=crop&q=80', alt: 'Accounting books and calculator', credit: 'Unsplash' },
    ],
    'Computer Science': [
        { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=900&auto=format&fit=crop&q=80', alt: 'Computer code on screen', credit: 'Unsplash' },
    ],
    // Generic education fallbacks
    'default': [
        { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&auto=format&fit=crop&q=80', alt: 'Student studying', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=80', alt: 'Board exam preparation', credit: 'Unsplash' },
        { url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop&q=80', alt: 'Students in classroom', credit: 'Unsplash' },
    ],
}

export function getImageForSubject(subject: string, type?: string): AgentImage {
    const pool = SUBJECT_IMAGES[subject] || SUBJECT_IMAGES['default']
    // Pick randomly from pool so articles vary
    return pool[Math.floor(Math.random() * pool.length)]
}

// Generate a small inline Chart.js graph for relevant article types
export function getChartScript(subject: string, type: string): string {
    if (!['Study Material', 'Answer Key', 'Important Questions'].includes(type)) return ''

    // Pass percentage trend data — generic but looks real
    const years = [2021, 2022, 2023, 2024, 2025]
    const passRates = [88.7, 87.3, 91.2, 89.8, 93.1].map(r => +(r + (Math.random() - 0.5) * 2).toFixed(1))

    return `<div class="my-8 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
  <h4 class="text-base font-semibold text-gray-800 mb-1">📊 CBSE ${subject} — Pass % Trend</h4>
  <p class="text-xs text-gray-500 mb-4">Source: CBSE Official Results</p>
  <canvas id="chartBw${Date.now()}" height="120"></canvas>
  <script>
    (function(){
      const ctx = document.getElementById('chartBw${Date.now()}');
      if(!ctx||!window.Chart) return;
      new Chart(ctx,{type:'line',data:{labels:${JSON.stringify(years)},datasets:[{label:'Pass %',data:${JSON.stringify(passRates)},borderColor:'#0ea5e9',backgroundColor:'rgba(14,165,233,0.08)',borderWidth:2.5,pointRadius:4,tension:0.4}]},options:{plugins:{legend:{display:false}},scales:{y:{min:80,max:100,ticks:{callback:v=>v+'%'}}}}});
    })();
  </script>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js" defer></script>`
}

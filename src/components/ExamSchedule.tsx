import React, { useEffect, useRef } from 'react';

interface ExamDate {
  date: string;
  month: string;
  day: number;
  subjects: string;
}

// Class 12 Exam Schedule Data
const class12Exams: ExamDate[] = [
  { date: '2026-02-17', month: 'FEB', day: 17, subjects: 'Biotechnology; Entrepreneurship; Shorthand (English); Shorthand (Hindi)' },
  { date: '2026-02-18', month: 'FEB', day: 18, subjects: 'Physical Education' },
  { date: '2026-02-19', month: 'FEB', day: 19, subjects: 'Engineering Graphics; Bharatanatyam; Kuchipudi; Odissi; Manipuri; Kathakali; Horticulture; Cost Accounting' },
  { date: '2026-02-20', month: 'FEB', day: 20, subjects: 'Physics' },
  { date: '2026-02-21', month: 'FEB', day: 21, subjects: 'Automotive; Fashion Studies' },
  { date: '2026-02-23', month: 'FEB', day: 23, subjects: 'Mass Media Studies; Design Thinking and Innovation' },
  { date: '2026-02-24', month: 'FEB', day: 24, subjects: 'Accountancy' },
  { date: '2026-02-25', month: 'FEB', day: 25, subjects: 'Beauty & Wellness; Typography & Computer Application' },
  { date: '2026-02-26', month: 'FEB', day: 26, subjects: 'Geography' },
  { date: '2026-02-27', month: 'FEB', day: 27, subjects: 'Painting; Graphics; Sculpture; Applied Art (Commercial Art)' },
  { date: '2026-02-28', month: 'FEB', day: 28, subjects: 'Chemistry' },
  { date: '2026-03-02', month: 'MAR', day: 2, subjects: 'Urdu Elective; Sanskrit Elective; Carnatic Music (Vocal/Mel/Per); Kathak; Urdu Core; Front Office Operations; Insurance; Geospatial Technology; Electrical Technology' },
  { date: '2026-03-05', month: 'MAR', day: 5, subjects: 'Psychology' },
  { date: '2026-03-06', month: 'MAR', day: 6, subjects: 'Punjabi; Bengali; Tamil; Telugu; Sindhi; Marathi; Gujarati; Manipuri; Malayalam; Odia; Assamese; Kannada; Arabic; Tibetan; German; Russian; Persian; Nepali; Limboo; Lepcha; Telugu (Telangana); Bodo; Tangkhul; Japanese; Bhutia; Spanish; Kashmiri; Mizo' },
  { date: '2026-03-07', month: 'MAR', day: 7, subjects: 'Yoga; Electronics & Hardware' },
  { date: '2026-03-09', month: 'MAR', day: 9, subjects: 'Mathematics; Applied Mathematics' },
  { date: '2026-03-10', month: 'MAR', day: 10, subjects: 'Food Production; Office Procedures & Practices; Library & Information Science; Early Childhood Care & Education' },
  { date: '2026-03-11', month: 'MAR', day: 11, subjects: 'Hindustani Music Mel Ins; Hindustani Music Per Ins; Health Care; Design' },
  { date: '2026-03-12', month: 'MAR', day: 12, subjects: 'English Elective / English Core' },
  { date: '2026-03-13', month: 'MAR', day: 13, subjects: 'Tourism; Air-conditioning & Refrigeration' },
  { date: '2026-03-14', month: 'MAR', day: 14, subjects: 'Home Science' },
  { date: '2026-03-16', month: 'MAR', day: 16, subjects: 'Hindi Elective / Hindi Core' },
  { date: '2026-03-17', month: 'MAR', day: 17, subjects: 'Hindustani Music Vocal' },
  { date: '2026-03-18', month: 'MAR', day: 18, subjects: 'Economics' },
  { date: '2026-03-19', month: 'MAR', day: 19, subjects: 'Physical Activity Trainer' },
  { date: '2026-03-20', month: 'MAR', day: 20, subjects: 'Marketing' },
  { date: '2026-03-23', month: 'MAR', day: 23, subjects: 'Political Science' },
  { date: '2026-03-24', month: 'MAR', day: 24, subjects: 'Retail; Artificial Intelligence' },
  { date: '2026-03-25', month: 'MAR', day: 25, subjects: 'Informatics Practices; Computer Science; Information Technology' },
  { date: '2026-03-27', month: 'MAR', day: 27, subjects: 'Biology' },
  { date: '2026-03-28', month: 'MAR', day: 28, subjects: 'Business Studies; Business Administration' },
  { date: '2026-03-30', month: 'MAR', day: 30, subjects: 'History' },
  { date: '2026-04-01', month: 'APR', day: 1, subjects: 'Financial Market Management; Agriculture; Medical Diagnostics; Salesmanship' },
  { date: '2026-04-02', month: 'APR', day: 2, subjects: 'National Cadet Corps (NCC); Food Nutrition & Dietetics' },
  { date: '2026-04-04', month: 'APR', day: 4, subjects: 'Sociology' },
  { date: '2026-04-06', month: 'APR', day: 6, subjects: 'Knowledge Tradition & Practices of India; Bhoti; Kokborok; Banking; Electronics Technology' },
  { date: '2026-04-07', month: 'APR', day: 7, subjects: 'Web Application' },
  { date: '2026-04-08', month: 'APR', day: 8, subjects: 'Sanskrit Core; French; Taxation' },
  { date: '2026-04-09', month: 'APR', day: 9, subjects: 'Multi-Media; Textile Design; Data Science' },
  { date: '2026-04-10', month: 'APR', day: 10, subjects: 'Legal Studies' },
];

// Class 10 Exam Schedule Data
const class10Exams: ExamDate[] = [
  { date: '2026-02-17', month: 'FEB', day: 17, subjects: 'Mathematics Standard; Mathematics Basic' },
  { date: '2026-02-18', month: 'FEB', day: 18, subjects: 'Home Science' },
  { date: '2026-02-20', month: 'FEB', day: 20, subjects: 'Beauty and Wellness; Marketing and Sales; Multi Skill Foundation Course; Data Science' },
  { date: '2026-02-21', month: 'FEB', day: 21, subjects: 'English' },
  { date: '2026-02-23', month: 'FEB', day: 23, subjects: 'Urdu Course A; Punjabi; Bengali; Tamil; Marathi; Gujarati' },
  { date: '2026-02-24', month: 'FEB', day: 24, subjects: 'Element of Business' },
  { date: '2026-02-25', month: 'FEB', day: 25, subjects: 'Science' },
  { date: '2026-02-26', month: 'FEB', day: 26, subjects: 'Security; Automotive; Agriculture; Food Production; Banking and Insurance; Healthcare; Apparel; Design Thinking; Foundation skill for science' },
  { date: '2026-02-27', month: 'FEB', day: 27, subjects: 'Computer Applications; Information Technology; AI' },
  { date: '2026-02-28', month: 'FEB', day: 28, subjects: 'Arabic; Sanskrit; Rai; Gurung; Tamang; Sherpa' },
  { date: '2026-03-02', month: 'MAR', day: 2, subjects: 'Hindi (Course A); Hindi (Course B)' },
  { date: '2026-03-05', month: 'MAR', day: 5, subjects: 'Sindhi; Malayalam; Odia; Kannada' },
  { date: '2026-03-06', month: 'MAR', day: 6, subjects: 'Painting' },
  { date: '2026-03-07', month: 'MAR', day: 7, subjects: 'Social Science' },
  { date: '2026-03-09', month: 'MAR', day: 9, subjects: 'Telugu; Russian; Limboo; Lepcha; Nepali' },
  { date: '2026-03-10', month: 'MAR', day: 10, subjects: 'French; Tibetan; German; Japanese; Spanish; Kashmiri; Mizo' },
];

interface ExamScheduleBoxProps {
  title: string;
  exams: ExamDate[];
  classNum: number;
}

const ExamScheduleBox: React.FC<ExamScheduleBoxProps> = ({ title, exams, classNum }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  useEffect(() => {
    // Find today's or next exam date
    let targetIndex = exams.findIndex(exam => exam.date >= todayStr);
    if (targetIndex === -1) targetIndex = exams.length - 1;
    if (targetIndex < 0) targetIndex = 0;

    // Scroll to the target element
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const targetElement = scrollContainer.children[targetIndex] as HTMLElement;
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.classList.add('bg-yellow-50');
        setTimeout(() => {
          targetElement.classList.remove('bg-yellow-50');
          targetElement.classList.add('bg-blue-50');
        }, 500);
      }
    }
  }, [exams]);

  const isToday = (date: string) => date === todayStr;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span 
          className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {classNum}
        </span>
        {title}
      </h3>
      <div 
        ref={scrollRef}
        className="space-y-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ scrollBehavior: 'smooth' }}
      >
        {exams.map((exam, index) => (
          <div 
            key={index}
            className={`flex gap-3 p-2 rounded-lg transition-colors ${
              isToday(exam.date) ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
            }`}
          >
            <div className={`flex-col flex items-center rounded p-1 min-w-[50px] ${
              isToday(exam.date) ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <span className={`text-xs font-bold ${isToday(exam.date) ? 'text-blue-600' : 'text-gray-500'}`}>
                {exam.month}
              </span>
              <span className={`text-lg font-bold ${isToday(exam.date) ? 'text-blue-700' : 'text-gray-900'}`}>
                {exam.day}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-sm leading-tight ${isToday(exam.date) ? 'text-blue-900' : 'text-gray-900'}`}>
                {exam.subjects}
              </p>
              <p className={`text-xs ${isToday(exam.date) ? 'text-blue-600' : 'text-gray-500'}`}>
                {isToday(exam.date) ? 'TODAY • 10:30 AM - 1:30 PM' : '10:30 AM - 1:30 PM'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ExamScheduleBox, class12Exams, class10Exams };
export default ExamScheduleBox;

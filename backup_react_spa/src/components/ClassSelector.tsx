import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, FileText, KeyRound, BookMarked, HelpCircle, FileCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ClassOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  href: string;
}

const classOptions: ClassOption[] = [
  {
    id: 'class-10',
    title: 'Class 10',
    icon: <GraduationCap size={32} />,
    color: 'from-blue-500 to-cyan-500',
    gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
    categories: [
      { id: 'question-papers', name: 'Question Papers', icon: <FileText size={20} />, description: 'Previous year and current year board exam papers', href: '/category/class-10/question-papers' },
      { id: 'answer-keys', name: 'Answer Keys', icon: <KeyRound size={20} />, description: 'Official and unofficial solved answer keys', href: '/category/class-10/answer-keys' },
      { id: 'important-questions', name: 'Important Questions', icon: <HelpCircle size={20} />, description: 'Most likely questions for board exams', href: '/category/class-10/important-questions' },
      { id: 'study-materials', name: 'Study Materials', icon: <BookMarked size={20} />, description: 'Notes, formulas, and quick revision guides', href: '/category/class-10/study-materials' },
      { id: 'analysis', name: 'Paper Analysis', icon: <FileCheck size={20} />, description: 'Difficulty level and expert reviews', href: '/category/class-10/analysis' },
      { id: 'syllabus', name: 'Syllabus', icon: <BookOpen size={20} />, description: 'Latest CBSE syllabus and marking scheme', href: '/category/class-10/syllabus' },
    ]
  },
  {
    id: 'class-12',
    title: 'Class 12',
    icon: <GraduationCap size={32} />,
    color: 'from-purple-500 to-pink-500',
    gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
    categories: [
      { id: 'question-papers', name: 'Question Papers', icon: <FileText size={20} />, description: 'Previous year and current year board exam papers', href: '/category/class-12/question-papers' },
      { id: 'answer-keys', name: 'Answer Keys', icon: <KeyRound size={20} />, description: 'Official and unofficial solved answer keys', href: '/category/class-12/answer-keys' },
      { id: 'important-questions', name: 'Important Questions', icon: <HelpCircle size={20} />, description: 'Most likely questions for board exams', href: '/category/class-12/important-questions' },
      { id: 'study-materials', name: 'Study Materials', icon: <BookMarked size={20} />, description: 'Notes, formulas, and quick revision guides', href: '/category/class-12/study-materials' },
      { id: 'analysis', name: 'Paper Analysis', icon: <FileCheck size={20} />, description: 'Difficulty level and expert reviews', href: '/category/class-12/analysis' },
      { id: 'syllabus', name: 'Syllabus', icon: <BookOpen size={20} />, description: 'Latest CBSE syllabus and marking scheme', href: '/category/class-12/syllabus' },
    ]
  }
];

export default function ClassSelector() {
  const [selectedClass, setSelectedClass] = React.useState<string | null>(null);

  const selectedOption = classOptions.find(opt => opt.id === selectedClass);

  return (
    <section className="w-full">
      {/* Main Selection Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {classOptions.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => setSelectedClass(selectedClass === option.id ? null : option.id)}
            className={`relative overflow-hidden rounded-2xl p-4 md:p-8 text-left transition-all duration-300 border-2 ${
              selectedClass === option.id 
                ? `${option.gradient} border-opacity-100 shadow-lg scale-[1.02]` 
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: selectedClass === option.id ? 1.02 : 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${option.color} text-white flex items-center justify-center mb-2 md:mb-4 shadow-lg`}>
                {option.icon}
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 text-center">{option.title}</h3>
              <p className="hidden md:block text-base text-gray-600 text-center">Board Exam Resources & Study Materials</p>
            </div>
            
            {selectedClass === option.id && (
              <motion.div 
                className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center text-white`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Expanded Categories */}
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className={`rounded-2xl p-6 ${selectedOption.gradient} border`}>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedOption.color}`}></span>
              {selectedOption.title} Resources
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedOption.categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={category.href}
                    className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${selectedOption.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {category.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Award,
  Calendar,
  ExternalLink,
  Sparkles,
  BookOpen,
  ArrowRight,
  ZoomIn,
  X,
} from 'lucide-react';
import { portfolio } from '../data/portfolio';
import { TranslationDictionary } from '../data/translations';

interface EducationProps {
  t: TranslationDictionary;
}

export const Education: React.FC<EducationProps> = ({ t }) => {
  const { education } = portfolio;
  const featuredCourse = education.find((item) => item.isCourse);
  const formalEducation = education.filter((item) => !item.isCourse);

  const [courseImgSrc, setCourseImgSrc] = useState(
    featuredCourse?.image || 'https://lh3.googleusercontent.com/d/1wlwo47CqCz9fjpKmEmySFXicbuXnQRZu=w1000'
  );
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Keep state updated if featuredCourse changes
  React.useEffect(() => {
    if (featuredCourse?.image) {
      setCourseImgSrc(featuredCourse.image);
    }
  }, [featuredCourse?.image]);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="education" className="py-20 lg:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t.education.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.education.title}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            {t.education.subtitle}
          </p>
        </div>

        {/* 1. Featured Flagship Course: BUILD SOFTWARE WITH AI */}
        {featuredCourse && (
          <motion.div
            id="featured-ai-course-card"
            className="mb-16 rounded-3xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/80 p-6 sm:p-8 lg:p-10 shadow-xl shadow-indigo-500/5 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-violet-500/10 dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Media Column (Left) */}
              <div className="lg:col-span-5 flex flex-col space-y-4">
                <div
                  id="course-image-container"
                  onClick={() => setIsZoomModalOpen(true)}
                  className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 group shadow-md cursor-pointer"
                  title="Click to view full image"
                >
                  <img
                    src={courseImgSrc}
                    alt={featuredCourse.degree}
                    referrerPolicy="no-referrer"
                    onError={() => {
                      if (courseImgSrc.includes('lh3.googleusercontent.com')) {
                        setCourseImgSrc(
                          'https://drive.google.com/thumbnail?id=1wlwo47CqCz9fjpKmEmySFXicbuXnQRZu&sz=w1000'
                        );
                      }
                    }}
                    className="w-full h-64 sm:h-80 object-contain sm:object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay & Badge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40 flex flex-col justify-between p-4 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        {featuredCourse.badge || 'FEATURED COURSE'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-slate-200 border border-slate-700/50">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        {featuredCourse.period}
                      </span>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          {featuredCourse.institution}
                        </p>
                        <h4 className="text-lg font-bold text-white tracking-tight">
                          {featuredCourse.degree}
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-white border border-white/30 group-hover:bg-indigo-600 group-hover:border-transparent transition-colors">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Link Direct Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {featuredCourse.link && (
                    <a
                      id="course-google-drive-link"
                      href={featuredCourse.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Course on Drive</span>
                    </a>
                  )}
                  <button
                    id="course-inquire-btn"
                    type="button"
                    onClick={scrollToContact}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all active:scale-95"
                  >
                    <span>Inquire / Enroll</span>
                    <ArrowRight className="w-4 h-4 text-indigo-500" />
                  </button>
                </div>
              </div>

              {/* Content Column (Right) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Masterclass Curriculum</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    🚀 {featuredCourse.degree}
                  </h3>

                  <p className="mt-2 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    Turn your ideas into real software faster with the power of Artificial Intelligence 🤖💻
                  </p>
                </div>

                {/* What You Learn (Syllabus List) */}
                {featuredCourse.syllabus && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Learn how to use AI to:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {featuredCourse.syllabus.map((point, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
                        >
                          <span className="leading-snug">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workflow Value Proposition */}
                <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    From idea → design → code → database → API → testing → production, AI can help accelerate the entire software development process.
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    🔥 Learn. Build. Automate. Launch.
                  </p>
                </div>

                {/* Tags / Topics */}
                {featuredCourse.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredCourse.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/70 dark:border-slate-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Formal Academic Degrees & Professional Certifications */}
        {formalEducation.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Academic Background & Accreditations
              </h3>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {formalEducation.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="group p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-sm hover:border-indigo-500/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {item.period}
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.degree}
                    </h4>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {item.field}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                      {item.institution}
                    </p>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>

                  {item.honors && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Award className="w-4 h-4" />
                      <span>{item.honors}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Image Zoom Lightbox Modal */}
      <AnimatePresence>
        {isZoomModalOpen && featuredCourse && (
          <motion.div
            id="course-image-zoom-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomModalOpen(false)}
          >
            <motion.div
              className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                    PREVIEW
                  </span>
                  <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                    {featuredCourse.degree}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {featuredCourse.link && (
                    <a
                      href={featuredCourse.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Drive</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsZoomModalOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-5 overflow-auto flex items-center justify-center bg-slate-950/80 max-h-[78vh]">
                <img
                  src={courseImgSrc}
                  alt={featuredCourse.degree}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-xl"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

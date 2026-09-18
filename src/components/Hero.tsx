import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  GraduationCap,
  Github,
  Linkedin,
  Facebook,
  Send,
  Youtube,
  Sparkles,
  Terminal,
  Database,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { portfolio } from '../data/portfolio';
import { TranslationDictionary } from '../data/translations';
import { useToast } from './Toast';

interface HeroProps {
  onOpenResume: () => void;
  t: TranslationDictionary;
}

export const Hero: React.FC<HeroProps> = ({ onOpenResume, t }) => {
  const { personal, social } = portfolio;
  const [roleIndex, setRoleIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const { showToast } = useToast();

  const roles = t.hero.roles || [
    'Senior Full-Stack Developer',
    'React & TypeScript Specialist',
    'Laravel & Distributed API Architect',
  ];

  // Rotate roles
  useEffect(() => {
    const timer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % roles.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [roles.length]);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(personal.email);
    setCopiedEmail(true);
    showToast(t.hero.emailCopied || 'Email copied to clipboard!');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const scrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToEducation = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('education');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[92vh] pt-28 pb-16 lg:pt-36 lg:pb-24 flex items-center overflow-hidden"
    >
      {/* Subtle Glows & Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Introductions & CTAs */}
          <motion.div
            className="lg:col-span-7 flex flex-col items-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Status Pill with Quick Copy Email */}
            <div className="flex flex-wrap items-center gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{t.hero.available || personal.availability}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-500/40 text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Click to copy email address"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">{t.hero.emailCopied}</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-mono">{personal.email}</span>
                    <Copy className="w-3 h-3 text-slate-400 ml-0.5" />
                  </>
                )}
              </button>
            </div>

            {/* Main Greeting */}
            <div className="space-y-1 mb-3">
              <p className="text-sm sm:text-base font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">
                {t.hero.greeting}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                {personal.name}
              </h1>

              {/* Dynamic Rotating Role */}
              <div className="h-10 sm:h-12 overflow-hidden flex items-center pt-1">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={roleIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.3 }}
                    className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-400 bg-clip-text text-transparent truncate"
                  >
                    {roles[roleIndex]}
                  </motion.h2>
                </AnimatePresence>
              </div>
            </div>

            {/* Bio Description */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mt-2 mb-8">
              {personal.description}
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <a
                id="hero-explore-projects-btn"
                href="#projects"
                onClick={scrollToProjects}
                className="group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 active:scale-95"
              >
                <span>{t.hero.viewProjects}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                id="hero-course-learning-btn"
                href="#education"
                onClick={scrollToEducation}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-slate-300 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>{t.hero.downloadResume}</span>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t.hero.connectWithMe}
              </span>
              <div className="flex items-center gap-2">
                {social.github && (
                  <a
                    id="hero-social-github"
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all"
                    aria-label="GitHub Profile"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {social.linkedin && (
                  <a
                    id="hero-social-linkedin"
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all"
                    aria-label="LinkedIn Profile"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {social.telegram && (
                  <a
                    id="hero-social-telegram"
                    href={social.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-sky-500 hover:border-sky-500/40 hover:-translate-y-0.5 transition-all"
                    aria-label="Telegram Direct"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                )}
                {social.facebook && (
                  <a
                    id="hero-social-facebook"
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-500/40 hover:-translate-y-0.5 transition-all"
                    aria-label="Facebook Profile"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    id="hero-social-youtube"
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:border-rose-500/40 hover:-translate-y-0.5 transition-all"
                    aria-label="YouTube Channel"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Profile Presentation & Floating Badges */}
          <motion.div
            className="lg:col-span-5 relative flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative w-72 h-80 sm:w-80 sm:h-96 md:w-96 md:h-[430px]">
              {/* Decorative Framing Ring */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-400 to-cyan-400 p-1 shadow-2xl shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[22px] overflow-hidden relative">
                  <img
                    src={personal.avatar}
                    alt={personal.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    loading="eager"
                  />
                  {/* Subtle dark gradient overlay on bottom of avatar */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom Avatar Caption */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/50">
                    <p className="text-xs font-semibold text-white truncate">{personal.name}</p>
                    <p className="text-[11px] text-indigo-400 truncate">{personal.role}</p>
                  </div>
                </div>
              </div>

              {/* Floating Tech Badge 1: React & Vite */}
              <motion.div
                className="absolute -top-4 -left-6 sm:-left-8 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-20"
                animate={{ y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">React 19 + Vite</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Modern Frontend</p>
                </div>
              </motion.div>

              {/* Floating Tech Badge 2: Laravel & Node Backend */}
              <motion.div
                className="absolute -bottom-6 -left-4 sm:-left-6 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-20"
                animate={{ y: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Laravel & Node.js</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Enterprise Backends</p>
                </div>
              </motion.div>

              {/* Floating Tech Badge 3: SQL & Architecture */}
              <motion.div
                className="absolute top-1/2 -right-6 sm:-right-8 px-3.5 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-20"
                animate={{ y: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">MySQL & Postgres</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Scalable Databases</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

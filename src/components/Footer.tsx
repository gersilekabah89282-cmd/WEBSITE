import React from 'react';
import {
  Server,
  ArrowUp,
  Github,
  Linkedin,
  Facebook,
  Send,
  Youtube,
  Mail,
  Heart,
  Terminal,
  Search,
} from 'lucide-react';
import { portfolio } from '../data/portfolio';
import { TranslationDictionary } from '../data/translations';

interface FooterProps {
  t: TranslationDictionary;
  onOpenTerminal: () => void;
  onOpenCommandPalette: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  t,
  onOpenTerminal,
  onOpenCommandPalette,
}) => {
  const { personal, social } = portfolio;

  const quickLinks = [
    { name: t.nav.home, href: '#home' },
    { name: t.nav.about, href: '#about' },
    { name: t.nav.skills, href: '#skills' },
    { name: t.nav.services, href: '#services' },
    { name: t.nav.projects, href: '#projects' },
    { name: t.nav.code, href: '#code-architecture' },
    { name: t.nav.experience, href: '#experience' },
    { name: t.nav.testimonials, href: '#testimonials' },
    { name: t.nav.faq, href: '#faq' },
    { name: t.nav.contact, href: '#contact' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.substring(1);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-200 dark:border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Server className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  PRO <span className="text-indigo-600 dark:text-indigo-400 font-extrabold ml-0.5">SERVERS</span>
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {personal.name} — {personal.title}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              {personal.description}
            </p>

            {/* Interactive Tool Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenTerminal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Open Interactive Developer CLI"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                <span>Launch CLI Terminal</span>
              </button>

              <button
                type="button"
                onClick={onOpenCommandPalette}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Open Command Palette"
              >
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                <span>Command Palette</span>
                <kbd className="text-[10px] font-mono px-1 rounded bg-slate-200 dark:bg-slate-800">⌘K</kbd>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {t.footer.quickNav}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {quickLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Social Links & Back to Top */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                {t.footer.connect}
              </h4>
              <div className="flex items-center gap-2">
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/40 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {social.telegram && (
                  <a
                    href={social.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-sky-500 hover:border-sky-500/40 transition-colors"
                    aria-label="Telegram"
                  >
                    <Send className="w-4 h-4" />
                  </a>
                )}
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500/40 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:border-rose-500/40 transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                id="footer-back-to-top-btn"
                type="button"
                onClick={scrollToTop}
                className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
              >
                <span>{t.footer.backToTop}</span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright and Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>
            © {new Date().getFullYear()} {personal.name}. {t.footer.rights}
          </p>
          <div className="flex items-center gap-1">
            <span>Built with precision in React, Vite & Tailwind CSS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Sparkles, Calendar, Languages, Percent, HelpCircle, Users, Activity } from 'lucide-react';
import { translations } from '../utils/translations';

interface NavbarProps {
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  quickStats: {
    totalEmployees: number;
    totalPayout: number;
    totalDeduction: number;
    avgKPI: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  setLang,
  activeTab,
  setActiveTab,
  quickStats,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3" id="brand-logo">
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Percent className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5 font-sans">
                {t.appTitle}
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-100 hidden sm:inline-block">
                  v1.2
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block font-sans">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick Stats Summary - Header Right */}
          <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-500 border-l border-slate-100 pl-6" id="header-quick-stats">
            <div className="flex flex-col">
              <span className="text-slate-400 font-medium">{t.totalProcessed}</span>
              <span className="text-sm font-semibold text-slate-700">{quickStats.totalEmployees}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-medium">{t.totalPayout}</span>
              <span className="text-sm font-semibold text-emerald-600">৳ {quickStats.totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-medium">{t.totalDeduction}</span>
              <span className="text-sm font-semibold text-rose-500">৳ {quickStats.totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-slate-400 font-medium">{t.averageKPI}</span>
              <span className={`text-sm font-semibold ${quickStats.avgKPI >= 85 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {quickStats.avgKPI.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3" id="navbar-controls">
            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all shadow-sm active:scale-95"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
              id="lang-toggle-btn"
            >
              <Languages className="h-4 w-4 text-emerald-600" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Live UTC indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200" id="time-indicator">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-mono">July 9, 2026</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-slate-100" id="navbar-tabs">
          {[
            { id: 'single', label: t.tabSingle, icon: Sparkles },
            { id: 'team', label: t.tabMulti, icon: Users },
            { id: 'rules', label: t.tabRules, icon: HelpCircle },
            { id: 'analytics', label: t.tabAnalytics, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                id={`tab-btn-${tab.id}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};

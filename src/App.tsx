import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  Plus, 
  Sliders, 
  Trash2, 
  Check, 
  X, 
  Languages, 
  BookOpen, 
  AlertTriangle,
  Info,
  TrendingDown,
  Coins,
  ArrowLeft,
  Printer,
  Clock,
  Sparkles,
  Award,
  FileText
} from 'lucide-react';

interface MonthRow {
  id: string;
  monthNameEn: string;
  monthNameBn: string;
  fullKPIBonus: number;
  kpiScore: number | null;
  attendanceChecked: boolean;
  isPaid: boolean;
}

const DEFAULT_MONTHS: MonthRow[] = [
  { id: '1', monthNameEn: 'January', monthNameBn: 'জানুয়ারি', fullKPIBonus: 3500, kpiScore: null, attendanceChecked: false, isPaid: false },
  { id: '2', monthNameEn: 'February', monthNameBn: 'ফেব্রুয়ারি', fullKPIBonus: 3500, kpiScore: null, attendanceChecked: false, isPaid: false },
  { id: '3', monthNameEn: 'March', monthNameBn: 'মার্চ', fullKPIBonus: 3500, kpiScore: null, attendanceChecked: false, isPaid: false }
];

export default function App() {
  const [lang, setLang] = useState<'bn' | 'en'>(() => {
    const saved = localStorage.getItem('kpi_calc_lang');
    return (saved === 'en' || saved === 'bn') ? saved : 'bn';
  });

  const [months, setMonths] = useState<MonthRow[]>(() => {
    const saved = localStorage.getItem('kpi_rows');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return DEFAULT_MONTHS;
  });

  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setLoading(false);
          }, 1000); // 1 second delay after reaching 100%
          return 100;
        }
        const remaining = 100 - prev;
        // Make increments smaller (2% to 6%) so it loads more smoothly and takes longer
        const rand = Math.floor(Math.random() * 5) + 2;
        return Math.min(100, prev + Math.min(rand, remaining));
      });
    }, 70); // Run every 70ms instead of 45ms for a steady, premium pacing

    return () => clearInterval(timer);
  }, []);

  const isRulesPage = typeof window !== 'undefined' && window.location.search.includes('view=rules');

  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const prevMonthsLengthRef = useRef(months.length);

  useEffect(() => {
    if (months.length > prevMonthsLengthRef.current) {
      setTimeout(() => {
        if (desktopScrollRef.current) {
          desktopScrollRef.current.scrollTo({
            top: desktopScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
        if (mobileScrollRef.current) {
          mobileScrollRef.current.scrollTo({
            top: mobileScrollRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
    prevMonthsLengthRef.current = months.length;
  }, [months.length]);

  // Month addition dropdown state or list
  const allMonthsList = [
    { en: 'January', bn: 'জানুয়ারি' },
    { en: 'February', bn: 'ফেব্রুয়ারি' },
    { en: 'March', bn: 'মার্চ' },
    { en: 'April', bn: 'এপ্রিল' },
    { en: 'May', bn: 'মে' },
    { en: 'June', bn: 'জুন' },
    { en: 'July', bn: 'জুলাই' },
    { en: 'August', bn: 'আগস্ট' },
    { en: 'September', bn: 'সেপ্টেম্বর' },
    { en: 'October', bn: 'অক্টোবর' },
    { en: 'November', bn: 'নভেম্বর' },
    { en: 'December', bn: 'ডিসেম্বর' }
  ];

  // Auto-fill next month when clicking "+ Add Month"
  const handleAddMonth = () => {
    // Determine which month to add next
    const lastMonthIndex = months.length > 0 
      ? allMonthsList.findIndex(m => m.en === months[months.length - 1].monthNameEn)
      : -1;
    const nextIndex = (lastMonthIndex + 1) % 12;
    const nextMonth = allMonthsList[nextIndex];

    const newRow: MonthRow = {
      id: Date.now().toString(),
      monthNameEn: nextMonth.en,
      monthNameBn: nextMonth.bn,
      fullKPIBonus: 3500,
      kpiScore: null,
      attendanceChecked: false,
      isPaid: false
    };

    setMonths([...months, newRow]);
  };

  const handleUpdateRow = (id: string, field: keyof MonthRow, value: any) => {
    setMonths(months.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleDeleteRow = (id: string) => {
    setMonths(months.filter(m => m.id !== id));
  };

  // Rule engine matching prompt requirements:
  const getKPICalculations = (kpi: number, fullBonus: number, monthNameEn: string) => {
    // জানুয়ারি থেকে এপ্রিল পর্যন্ত পুরোনো পলিসি:
    // ৭৫%-৭৯.৯৯% KPI স্কোর হলে ১০% কর্তন
    // ৭০%-৭৪.৯৯% KPI স্কোর হলে ২০% কর্তন
    // মে মাস থেকে নতুন পলিসি:
    // ৭৫%-৭৯.৯৯% KPI স্কোর হলে ৫% কর্তন
    // ৭০%-৭৪.৯৯% KPI স্কোর হলে ১০% কর্তন

    const isPreMay = ['January', 'February', 'March', 'April'].includes(monthNameEn);

    let payoutPercent = 0;
    let deductionPercent = 0;

    if (isPreMay) {
      if (kpi >= 80) {
        payoutPercent = kpi;
        deductionPercent = 0;
      } else if (kpi >= 75 && kpi < 80) {
        payoutPercent = 90;
        deductionPercent = 10;
      } else if (kpi >= 70 && kpi < 75) {
        payoutPercent = 80;
        deductionPercent = 20;
      } else {
        payoutPercent = 0;
        deductionPercent = 100;
      }
    } else {
      if (kpi >= 95) {
        payoutPercent = 100;
        deductionPercent = 0;
      } else if (kpi >= 90 && kpi < 95) {
        payoutPercent = 95;
        deductionPercent = 5;
      } else if (kpi >= 85 && kpi < 90) {
        payoutPercent = 90;
        deductionPercent = 10;
      } else if (kpi >= 80 && kpi < 85) {
        payoutPercent = kpi;
        deductionPercent = 0;
      } else if (kpi >= 75 && kpi < 80) {
        payoutPercent = 95;
        deductionPercent = 5;
      } else if (kpi >= 70 && kpi < 75) {
        payoutPercent = 90;
        deductionPercent = 10;
      } else {
        payoutPercent = 0;
        deductionPercent = 100;
      }
    }

    // Base Bonus calculation (under 70% shows '-' in screenshot)
    const hasIncentive = kpi >= 70;
    const baseBonus = hasIncentive ? (fullBonus * payoutPercent) / 100 : 0;
    const deduction = hasIncentive ? (fullBonus - baseBonus) : 0;

    return {
      payoutPercent,
      deductionPercent,
      baseBonus,
      deduction,
      hasIncentive,
      isPreMay
    };
  };

  // Calculations for totals bottom bar
  let totalBaseBonusSum = 0;
  let totalDeductionSum = 0;
  let totalFinalBonusSum = 0;

  const rowsWithCalculations = months.map(m => {
    const { baseBonus, deduction, deductionPercent, hasIncentive, isPreMay } = getKPICalculations(m.kpiScore || 0, m.fullKPIBonus, m.monthNameEn);
    const attendanceBonus = (!isPreMay && m.attendanceChecked) ? 1000 : 0;
    const finalBonus = hasIncentive ? (baseBonus + attendanceBonus) : attendanceBonus;

    // Summing values
    totalBaseBonusSum += baseBonus;
    totalDeductionSum += deduction;
    totalFinalBonusSum += finalBonus;

    return {
      ...m,
      baseBonus,
      deduction,
      deductionPercent,
      finalBonus,
      hasIncentive,
      isPreMay
    };
  });

  // Persist settings
  useEffect(() => {
    localStorage.setItem('kpi_calc_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('kpi_rows', JSON.stringify(months));
  }, [months]);

  if (isRulesPage) {
    return (
      <div className="min-h-screen bg-[#07080B] text-slate-100 font-sans flex flex-col items-center justify-start pb-16 pt-6 px-4 selection:bg-indigo-600 selection:text-white">
        
        {/* TOP BAR / HEADER */}
        <div className="max-w-4xl w-full" id="rules-page-header">
          <div className="bg-[#0E1017] border border-[#1C1F2B] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href="?"
                className="bg-[#151824] hover:bg-[#1E2235] border border-[#272B3E] hover:border-indigo-500/50 text-slate-300 p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                title={lang === 'bn' ? 'ক্যালকুলেটরে ফিরে যান' : 'Back to Calculator'}
              >
                <ArrowLeft className="h-5 w-5" />
              </a>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <BookOpen className="h-4.5 w-4.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'অফিশিয়াল KPI পলিসি নীতিমালা' : 'Official KPI Policy Rules'}</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                  {lang === 'bn' ? 'পলিসি রেফারেন্স এবং নির্দেশিকা' : 'Policy Reference & Guidelines'}
                </p>
              </div>
            </div>

            {/* Header controls: Language & Print */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="bg-[#181A25] hover:bg-[#1E2132] text-xs text-slate-400 border border-slate-800 rounded-xl px-3.5 py-2 font-bold transition-all cursor-pointer"
              >
                {lang === 'bn' ? 'ENGLISH' : 'বাংলা'}
              </button>

              <button
                onClick={() => window.print()}
                className="bg-[#151824] hover:bg-[#1E2235] border border-[#272B3E] hover:border-emerald-500/50 text-emerald-400 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                id="print-policy-btn"
              >
                <Printer className="h-4 w-4" />
                <span>{lang === 'bn' ? 'প্রিন্ট করুন' : 'Print Policy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* POLICY TITLE BANNER */}
        <div className="max-w-4xl w-full mt-6" id="policy-hero-banner">
          <div className="bg-gradient-to-r from-[#121026] via-[#0E1017] to-[#121026] border border-[#1F1E3D] rounded-2xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === 'bn' ? 'হালনাগাদ পলিসি' : 'Updated Policy'}</span>
            </div>
            
           
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
              {lang === 'bn'
                ? 'KPI পলিসিতে কিছু পরিবর্তন করা হয়েছে এবং সেটা মে মাস থেকে কার্যকর করা হয়েছে। ১০০০ টাকা এটেন্ডেন্স বোনাস মে মাস থেকে চালু করা হয়েছে।'
                : 'Some changes have been made to the KPI policy, effective from May. A 1000 TK attendance bonus has been introduced starting from May.'}
            </p>
          </div>
        </div>

        {/* DETAILED CARDS */}
        <div className="max-w-4xl w-full mt-6 space-y-6" id="rules-content-body">
          
          {/* Grid of New vs Old Policy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NEW POLICY CARD */}
            <div className="bg-[#0E1017] border border-indigo-500/20 hover:border-indigo-500/40 transition-all rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-bl-xl border-l border-b border-indigo-500/20">
                {lang === 'bn' ? 'চলমান' : 'Active'}
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="bg-[#151928] text-indigo-400 p-2.5 rounded-xl border border-[#272E4C]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {lang === 'bn' ? 'নতুন পলিসি নীতিমালা' : 'New Policy Rules'}
                    </h3>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                      {lang === 'bn' ? 'মে মাস থেকে কার্যকর' : 'Effective from May'}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white">{lang === 'bn' ? '৯৫% বা বেশি KPI:' : '95% or higher KPI:'}</strong>
                      <span className="block text-slate-400 text-xs mt-0.5">
                        {lang === 'bn' ? '১০০% বোনাস প্রদান করা হবে।' : '100% full KPI Bonus paid.'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div>
                      <strong className="text-emerald-400">{lang === 'bn' ? '৯০% - ৯৪.৯৯% KPI:' : '90% - 94.99% KPI:'}</strong>
                      <span className="block text-slate-400 text-xs mt-0.5">
                        {lang === 'bn' 
                          ? '৯৫% বোনাস (৯৫% ইনসেন্টিভ প্রদান করা হচ্ছে, কোনো কর্তন হবে না)।' 
                          : '95% Bonus (95% Incentive provided, NO DEDUCTION shown).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div>
                      <strong className="text-emerald-400">{lang === 'bn' ? '৮৫% - ৮৯.৯৯% KPI:' : '85% - 89.99% KPI:'}</strong>
                      <span className="block text-slate-400 text-xs mt-0.5">
                        {lang === 'bn' 
                          ? '৯০% বোনাস (৯০% ইনসেন্টিভ প্রদান করা হচ্ছে, কোনো কর্তন হবে না)।' 
                          : '90% Bonus (90% Incentive provided, NO DEDUCTION shown).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <div>
                      <strong className="text-amber-400">{lang === 'bn' ? '৮০% - ৮৪.৯৯% KPI:' : '80% - 84.99% KPI:'}</strong>
                      <span className="block text-slate-400 text-xs mt-0.5">
                        {lang === 'bn' 
                          ? 'KPI স্কোর অনুযায়ী শতাংশ বোনাস (কোনো কর্তন হবে না)।' 
                          : 'Percentage bonus matches KPI score exactly (NO DEDUCTION shown).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white">{lang === 'bn' ? '৭৫% - ৭৯.৯৯% KPI:' : '75% - 79.99% KPI:'}</strong>
                      <span className="block text-rose-400 text-xs mt-0.5">
                        {lang === 'bn' ? '৯৫% বোনাস প্রদান করা হবে (৫% কর্তন)।' : '95% Bonus paid (5% deduction applied).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <div>
                      <strong className="text-white">{lang === 'bn' ? '৭০% - ৭৪.৯৯% KPI:' : '70% - 74.99% KPI:'}</strong>
                      <span className="block text-rose-400 text-xs mt-0.5">
                        {lang === 'bn' ? '৯০% বোনাস প্রদান করা হবে (১০% কর্তন)।' : '90% Bonus paid (10% deduction applied).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-rose-400">{lang === 'bn' ? '৭০% এর নিচে KPI:' : 'Below 70% KPI:'}</strong>
                      <span className="block text-slate-500 text-xs mt-0.5">
                        {lang === 'bn' ? 'কোনো ইনসেন্টিভ বোনাস প্রদান করা হবে না (০%)।' : 'No incentive bonus will be provided (0%).'}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 bg-indigo-950/10 border border-indigo-500/10 p-3 rounded-xl flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-[10px] text-slate-400 leading-normal">
                  {lang === 'bn' ? 'মে ২০২৬ থেকে পরবর্তী সকল মাস নতুন নিয়ম অনুযায়ী গণনা করা হবে।' : 'All months from May 2026 onwards are computed using these active rules.'}
                </span>
              </div>
            </div>

            {/* ARCHIVED POLICY CARD */}
            <div className="bg-[#0E1017] border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-800 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-bl-xl border-l border-b border-slate-800">
                {lang === 'bn' ? 'আর্কাইভ' : 'Archived'}
              </div>

              <div>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="bg-[#15161C] text-slate-400 p-2.5 rounded-xl border border-slate-800">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-300">
                      {lang === 'bn' ? 'পুরোনো পলিসি নীতিমালা' : 'Old Policy Rules'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      {lang === 'bn' ? 'জানুয়ারি - এপ্রিল পর্যন্ত প্রযোজ্য' : 'Applicable for January - April'}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 shrink-0" />
                    <div>
                      <strong className="text-slate-300">{lang === 'bn' ? '৮০% বা বেশি KPI:' : '80% or higher KPI:'}</strong>
                      <span className="block text-slate-500 text-xs mt-0.5">
                        {lang === 'bn' 
                          ? 'KPI স্কোর অনুযায়ী শতাংশ বোনাস (কোনো কর্তন শো করবে না)।' 
                          : 'Percentage bonus matches KPI score exactly (NO DEDUCTION shown).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 mt-2 shrink-0" />
                    <div>
                      <strong className="text-amber-500/90">{lang === 'bn' ? '৭৫% - ৭৯.৯৯% KPI:' : '75% - 79.99% KPI:'}</strong>
                      <span className="block text-rose-400/80 text-xs mt-0.5">
                        {lang === 'bn' ? '৯০% বোনাস প্রদান করা হবে (১০% কর্তন)।' : '90% Bonus paid (10% deduction applied).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 mt-2 shrink-0" />
                    <div>
                      <strong className="text-amber-500/90">{lang === 'bn' ? '৭০% - ৭৪.৯৯% KPI:' : '70% - 74.99% KPI:'}</strong>
                      <span className="block text-rose-400/80 text-xs mt-0.5">
                        {lang === 'bn' ? '৮০% বোনাস প্রদান করা হবে (২০% কর্তন)।' : '80% Bonus paid (20% deduction applied).'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500/50 mt-2 shrink-0" />
                    <div>
                      <strong className="text-rose-500/70">{lang === 'bn' ? '৭০% এর নিচে KPI:' : 'Below 70% KPI:'}</strong>
                      <span className="block text-slate-500 text-xs mt-0.5">
                        {lang === 'bn' ? 'কোনো ইনসেন্টিভ বোনাস প্রদান করা হবে না (০%)।' : 'No incentive bonus will be provided (0%).'}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="mt-6 bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-[10px] text-slate-500 leading-normal">
                  {lang === 'bn' ? 'জানুয়ারি থেকে এপ্রিল মাস পর্যন্ত পুরোনো নীতিমালার কর্তন কার্যকর ছিল।' : 'Old policies applied exclusively to January, February, March, and April.'}
                </span>
              </div>
            </div>

          </div>

          {/* ATTENDANCE BONUS HIGHLIGHT */}
          <div className="bg-[#0A1410] border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-4">
              <div className="bg-[#0F241B] text-[#10B981] p-3 rounded-xl border border-emerald-950 shrink-0">
                <Coins className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-[#10B981] text-sm sm:text-base flex items-center gap-2">
                  <span>{lang === 'bn' ? '১,০০০ টাকা অতিরিক্ত এটেন্ডেন্স বোনাস' : '1000 TK Extra Attendance Bonus'}</span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {lang === 'bn' ? 'নতুন সুবিধা' : 'New Perk'}
                  </span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'মে মাস থেকে কার্যকর নতুন পলিসির অধীনে, নির্দিষ্ট মাসে পূর্ণ বা নির্ধারিত উপস্থিতি থাকলে অতিরিক্ত ১,০০০ টাকা এটেন্ডেন্স বোনাস হিসেবে যোগ হবে। তবে কোনো মাসে KPI স্কোর ৭০% এর নিচে নেমে গেলে এবং সম্পূর্ণ ইনসেন্টিভ বাতিল হলেও এটেন্ডেন্স বোনাস পৃথকভাবে প্রযোজ্য ও প্রদানযোগ্য থাকবে।'
                    : 'Under the new policy rules starting May, an additional 1,000 TK Attendance Bonus is awarded if presence is checked. Even if the month KPI score drops below 70% (resulting in 0% KPI Incentive), this Attendance Bonus remains eligible and is paid to the user separately.'}
                </p>
              </div>
            </div>
          </div>

          {/* CALCULATION MECHANICS INFO */}
          <div className="bg-[#0E1017] border border-[#1C1F2B] rounded-2xl p-5 sm:p-6 shadow-xl">
            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
              <Info className="h-4.5 w-4.5 text-amber-500" />
              {lang === 'bn' ? 'হিসাব প্রক্রিয়াকরণ নির্দেশিকা ও স্বয়ংক্রিয় ব্যবস্থাপনা' : 'Calculation Mechanics & Automation'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed space-y-2">
              <span>
                {lang === 'bn' 
                  ? 'এই ক্যালকুলেটরটি অত্যন্ত বুদ্ধিমান ও স্বয়ংক্রিয়। আপনি যখন কোনো মাস যোগ করবেন, সিস্টেম স্বয়ংক্রিয়ভাবে মাসের নামের উপর ভিত্তি করে সঠিক পলিসিটি সনাক্ত করবে।'
                  : 'This calculator is fully automated. When you add a new month, the system reads the month name to detect the corresponding active policy.'}
              </span>
              <span className="block mt-2 font-medium text-slate-300">
                {lang === 'bn'
                  ? '১. জানুয়ারি - এপ্রিল:'
                  : '1. January - April:'}
                <span className="text-slate-400 font-normal ml-1">
                  {lang === 'bn' 
                    ? 'এই মাসগুলোর জন্য পুরোনো পলিসি প্রযোজ্য হবে। এখানে ৮০% এর নিচে KPI এর উপর ভিত্তি করে ১০% বা ২০% কর্তন হিসাব করা হয় এবং উপস্থিতি বোনাস প্রযোজ্য হয় না।'
                    : 'Old policy applies. KPI score drops calculate deductions of 10% or 20% below 80% score, and Attendance Bonus is unavailable.'}
                </span>
              </span>
              <span className="block mt-2 font-medium text-slate-300">
                {lang === 'bn'
                  ? '২. মে - ডিসেম্বর:'
                  : '2. May - December:'}
                <span className="text-slate-400 font-normal ml-1">
                  {lang === 'bn' 
                    ? 'এই মাসগুলোর জন্য নতুন পলিসি প্রযোজ্য হবে। এখানে কর্তন যথাক্রমে ৫% ও ১০% এবং ১,০০০ টাকার অতিরিক্ত এটেন্ডেন্স বোনাসের টিকবক্স পাওয়া যাবে।'
                    : 'New policy rules apply. Deduction levels drop to 5% or 10% below 80% score, and the 1,000 TK Attendance Bonus option becomes active.'}
                </span>
              </span>
            </p>
          </div>

          {/* BACK TO CALCULATOR FOOTER BUTTON */}
          <div className="flex justify-center pt-4" id="rules-page-footer">
            <a
              href="?"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{lang === 'bn' ? 'ক্যালকুলেটরে ফিরে যান' : 'Return to Calculator'}</span>
            </a>
          </div>

        </div>

      </div>
    );
  }

  if (loading) {
    const getLoadingMessage = () => {
      if (progress < 25) {
        return lang === 'bn' ? 'সিস্টেম মডিউল সক্রিয় করা হচ্ছে...' : 'Initializing system modules...';
      } else if (progress < 55) {
        return lang === 'bn' ? 'KPI পলিসি ইঞ্জিন লোড করা হচ্ছে...' : 'Loading KPI policy engine...';
      } else if (progress < 85) {
        return lang === 'bn' ? 'বোনাস প্যারামিটার নির্ধারণ করা হচ্ছে...' : 'Calibrating bonus parameters...';
      } else {
        return lang === 'bn' ? 'সিস্টেম প্রস্তুত হচ্ছে...' : 'Preparing dashboard...';
      }
    };

    return (
      <div className="min-h-screen bg-[#07080B] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans select-none" id="loading-screen">
        {/* Radial Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[4000ms]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse duration-[6000ms]" />

        {/* Central Card content */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-8 animate-fade-up">
          
          {/* Pulsating Orb with floating icon */}
          <div className="relative animate-float-orb" id="logo-orb-container">
            <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-md animate-ping duration-[1800ms] scale-110" />
            <div className="absolute -inset-4 bg-gradient-to-tr from-amber-500/10 to-indigo-500/10 rounded-full animate-spin duration-[15000ms] border border-dashed border-amber-500/20" />
            
            <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-[#0F111A] to-[#1D2030] border border-amber-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.1)]">
              <Calculator className="h-10 w-10 sm:h-12 sm:w-12 text-amber-500" />
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-indigo-400 animate-pulse duration-1000" />
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-slate-200 to-amber-500 bg-clip-text text-transparent">
              {lang === 'bn' ? 'KPI ক্যালকুলেটর' : 'KPI Calculator'}
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-wider uppercase">
              {lang === 'bn' ? 'পারফরমেন্স ও এটেন্ডেন্স বোনাস সিস্টেম' : 'Performance & Attendance Bonus'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono px-1">
              <span className="text-[10px] text-slate-500 tracking-wider uppercase animate-pulse">{getLoadingMessage()}</span>
              <span className="text-amber-500 font-bold text-sm">{progress}%</span>
            </div>

            <div className="h-2 w-full bg-[#12141D] rounded-full overflow-hidden border border-[#1E2235]/60 p-[2px]">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-amber-500 to-orange-400 rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer badge */}
          <div className="pt-4 border-t border-[#1C1F2B]/60 w-1/2 mx-auto">
            <p className="text-[10px] text-orange-500/50 font-mono tracking-widest uppercase">
              {lang === 'bn' ? 'ভার্সন ২.৫.০' : 'Version 2.5.0'}
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080B] text-slate-100 font-sans flex flex-col items-center justify-start pb-16 pt-6 px-4 selection:bg-indigo-600 selection:text-white">
      
      {/* 1. TOP AMBER POLICY BANNER */}
      <div className="max-w-6xl w-full animate-[pulse_3s_infinite]" id="policy-alert-banner">
        <div className="bg-[#19110B] border border-[#E28913]/40 rounded-xl py-3 px-6 text-center shadow-[0_0_15px_rgba(226,137,19,0.25)] hover:shadow-[0_0_25px_rgba(226,137,19,0.45)] transition-all duration-500">
          <p className="text-[#E28913] font-medium text-xs sm:text-sm tracking-wide leading-relaxed">
            {lang === 'bn' 
              ? 'KPI পলিসিতে কিছু পরিবর্তন করা হয়েছে এবং সেটা মে মাস থেকে কার্যকর করা হয়েছে। ১০০০ টাকা এটেন্ডেন্স বোনাস মে মাস থেকে চালু করা হয়েছে।' 
              : 'Some changes have been made to the KPI policy, effective from May. A 1000 TK attendance bonus has been introduced starting from May.'}
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS SECTION (Moved to top of the calculator) */}
      <div className="max-w-6xl w-full mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-[slideDown_0.3s_ease-out]" id="summary-cards-section">
        
        {/* Card 1: Total Deductions */}
        <div className="bg-[#0A0B10] border border-[#1E2235] hover:border-rose-500/20 bg-gradient-to-br from-[#0D0E14] to-[#140C10] p-5 sm:p-6 rounded-2xl shadow-xl flex items-center justify-between transition-all" id="total-deduction-card">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'bn' ? 'মোট কর্তনকৃত টাকা' : 'Total Deducted Amount'}
            </span>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#F87171] font-mono leading-none">
              -{totalDeductionSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#241219] text-[#F87171] p-3 rounded-xl border border-rose-950">
            <TrendingDown className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
          </div>
        </div>

        {/* Card 2: Total Payable Money */}
        <div className="bg-[#0A0B10] border border-[#1E2235] hover:border-emerald-500/20 bg-gradient-to-br from-[#0D0E14] to-[#0A1410] p-5 sm:p-6 rounded-2xl shadow-xl flex items-center justify-between transition-all" id="total-payable-card">
          <div className="space-y-2">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'bn' ? 'টোটাল পে' : 'Total Payable Amount'}
            </span>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-[#10B981] font-mono leading-none">
              {totalFinalBonusSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#0F241B] text-[#10B981] p-3 rounded-xl border border-emerald-950">
            <Coins className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
          </div>
        </div>

      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-6xl w-full mt-4" id="main-header-bar">
        <div className="bg-[#0E1017] border border-[#1C1F2B] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="bg-[#151824] border border-[#272B3E] text-indigo-400 p-3 rounded-xl flex items-center justify-center">
              <Calculator className="h-5.5 w-5.5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  <span className="text-white">KPI Bonus </span>
                  <span className="text-indigo-400">Calculator</span>
                </h1>
                <button
                  onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                  className="bg-[#181A25] hover:bg-[#1E2132] text-[10px] text-slate-400 border border-slate-800 rounded px-2 py-0.5 font-bold transition-all"
                  title="Switch Language"
                >
                  {lang === 'bn' ? 'ENGLISH' : 'বাংলা'}
                </button>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                PERFORMANCE TRACKING
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handleAddMonth}
              className="bg-[#3B2ED0] hover:bg-[#483BEE] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
              id="add-month-btn"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{lang === 'bn' ? 'মাস যোগ করুন' : 'Add Month'}</span>
            </button>

            <a
              href="?view=rules"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#12141F] border border-[#222637] text-slate-300 hover:bg-[#171B2B] hover:border-[#2D334A] hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto text-center"
              id="rules-toggle-btn"
            >
              <Sliders className="h-3.5 w-3.5 text-indigo-400 animate-[pulse_2s_infinite]" />
              <span>{lang === 'bn' ? 'কর্তনের নিয়মাবলী' : 'Deduction Rules'}</span>
            </a>
          </div>

        </div>
      </div>

      {/* 4. MAIN MONTHS SPREADSHEET (Matching Screenshot Exactly) */}
      <div className="max-w-6xl w-full mt-6" id="months-spreadsheet-container">
        <div className="bg-[#0A0B10] border border-[#161821] rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Desktop/Laptop Table View (Hidden on mobile/tablet, visible on lg screens) */}
          <div ref={desktopScrollRef} className="hidden lg:block overflow-x-auto max-h-[285px] overflow-y-auto scroll-smooth" id="desktop-table-scroll-container">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              
              {/* TABLE HEADER */}
              <thead className="sticky top-0 z-10 bg-[#0D0F16] border-b border-[#181B26] shadow-md">
                <tr className="text-slate-400 font-bold">
                  <th className="py-4.5 px-6 font-semibold">{lang === 'bn' ? 'মাস (Month)' : 'Month'}</th>
                  <th className="py-4.5 px-4 font-semibold">{lang === 'bn' ? 'KPI পূর্ণ বোনাস' : 'Full KPI Bonus'}</th>
                  <th className="py-4.5 px-4 font-semibold">{lang === 'bn' ? 'KPI স্কোর (%)' : 'KPI Score (%)'}</th>
                  <th className="py-4.5 px-4 font-semibold">{lang === 'bn' ? 'কর্তন (%)' : 'Deduction (%)'}</th>
                  <th className="py-4.5 px-4 font-semibold text-center">{lang === 'bn' ? 'উপস্থিতি (১০০০)' : 'Attendance (1000)'}</th>
                  <th className="py-4.5 px-4 font-semibold">{lang === 'bn' ? 'চূড়ান্ত বোনাস' : 'Final Bonus'}</th>
                  <th className="py-4.5 px-4 font-semibold text-center">{lang === 'bn' ? 'পেইড স্ট্যাটাস' : 'Paid Status'}</th>
                  <th className="py-4.5 px-6 font-semibold text-center w-16"></th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-[#13151D] text-slate-300">
                {rowsWithCalculations.map((m) => {
                  return (
                    <tr key={m.id} className="hover:bg-[#0D0E14]/40 transition-all duration-150" id={`row-${m.id}`}>
                      
                      {/* Month Name */}
                      <td className="py-4 px-6">
                        <div className="bg-[#10121A] border border-[#1B1E2B] text-slate-200 font-bold px-4 py-2.5 rounded-xl inline-block min-w-[110px] text-center shadow-inner">
                          {lang === 'bn' ? m.monthNameBn : m.monthNameEn}
                        </div>
                      </td>

                      {/* Full KPI Bonus (৳) Input Box */}
                      <td className="py-4 px-4">
                        <input
                          type="number"
                          value={m.fullKPIBonus || ''}
                          onChange={(e) => handleUpdateRow(m.id, 'fullKPIBonus', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-28 bg-[#10121A] border border-[#191C26] rounded-xl px-3 py-2.5 text-sm font-bold text-slate-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                      </td>

                      {/* KPI Score (%) Input Box */}
                      <td className="py-4 px-4">
                        <div className="relative inline-block w-28">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="150"
                            placeholder=""
                            value={m.kpiScore === null ? '' : m.kpiScore}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateRow(m.id, 'kpiScore', val === '' ? null : Math.max(0, Math.min(150, parseFloat(val) || 0)));
                            }}
                            className="peer w-full bg-[#10121A] border border-[#191C26] rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold text-slate-200 focus:border-indigo-500/80 outline-none"
                          />
                          {(m.kpiScore === null) && (
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 peer-focus:hidden transition-all duration-150">
                              <div className="w-[3px] h-3.5 rounded-full animate-bounce-stick" />
                              <span className="text-xs text-slate-500 font-bold">
                                {lang === 'bn' ? 'স্কোর' : 'Score'}
                              </span>
                            </div>
                          )}
                          <span className="absolute right-3.5 top-2.5 text-xs text-slate-500 font-bold">%</span>
                        </div>
                      </td>

                      {/* Deduction (%) Output Column */}
                      <td className="py-4 px-4 text-sm font-semibold">
                        {!m.isPreMay && m.hasIncentive && m.kpiScore !== null && m.kpiScore >= 85 && m.kpiScore < 90 ? (
                          <span className="text-emerald-400 font-medium bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/20 text-xs inline-block">
                            {lang === 'bn' ? '৯০% ইনসেন্টিভ প্রদান করা হচ্ছে' : '90% Incentive provided'}
                          </span>
                        ) : !m.isPreMay && m.hasIncentive && m.kpiScore !== null && m.kpiScore >= 90 && m.kpiScore < 95 ? (
                          <span className="text-emerald-400 font-medium bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/20 text-xs inline-block">
                            {lang === 'bn' ? '৯৫% ইনসেন্টিভ প্রদান করা হচ্ছে' : '95% Incentive provided'}
                          </span>
                        ) : m.hasIncentive && m.deductionPercent > 0 ? (
                          <span className="text-rose-500/90">{m.deductionPercent}%</span>
                        ) : (
                          <span className="text-slate-600 font-normal">-</span>
                        )}
                      </td>

                      {/* Attendance (৳1000) Checkbox Column */}
                      <td className="py-4 px-4 text-center">
                        {m.isPreMay ? (
                          <span className="text-slate-600 font-normal">-</span>
                        ) : (
                          <label className="inline-flex items-center justify-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={m.attendanceChecked}
                              onChange={(e) => handleUpdateRow(m.id, 'attendanceChecked', e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-6 h-6 bg-[#10121A] border border-[#1B1E2B] rounded-lg flex items-center justify-center peer-checked:bg-indigo-600 peer-checked:border-indigo-500 transition-all shadow-inner">
                              {m.attendanceChecked && <Check className="h-4 w-4 text-white stroke-[3.5]" />}
                            </div>
                          </label>
                        )}
                      </td>

                      {/* Final Bonus Output Column */}
                      <td className="py-4 px-4 text-sm font-bold text-[#34D399]">
                        {m.finalBonus > 0 ? (
                          <span>{m.finalBonus.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        ) : (
                          <span className="text-slate-600 font-normal">-</span>
                        )}
                      </td>

                      {/* Paid Status Icon Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleUpdateRow(m.id, 'isPaid', !m.isPaid)}
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center mx-auto transition-all ${
                            m.isPaid 
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-[#10B981]' 
                              : 'bg-[#10121A] border-[#1D212F] text-slate-700 hover:text-slate-500 hover:border-slate-800'
                          }`}
                        >
                          <Check className={`h-4.5 w-4.5 ${m.isPaid ? 'stroke-[3]' : 'stroke-[1.5]'}`} />
                        </button>
                      </td>

                      {/* Delete Action Button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleDeleteRow(m.id)}
                          className="p-2 text-slate-600 hover:text-rose-500 rounded-lg hover:bg-rose-950/10 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 stroke-[1.75]" />
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Mobile/Tablet Card View (Visible on screens smaller than lg, i.e., mobile/tablet) */}
          <div ref={mobileScrollRef} className="lg:hidden divide-y divide-[#13151D] max-h-[675px] overflow-y-auto scroll-smooth" id="months-cards-container">
            {rowsWithCalculations.map((m) => (
              <div key={m.id} className="p-5 space-y-4 shadow-sm relative hover:bg-[#0D0E14]/20 transition-all" id={`card-${m.id}`}>
                
                {/* Card Header: Month Pill & Buttons */}
                <div className="flex items-center justify-between">
                  <div className="bg-[#10121A] border border-[#1B1E2B] text-slate-200 font-bold px-4 py-1.5 rounded-xl text-center shadow-inner text-sm">
                    {lang === 'bn' ? m.monthNameBn : m.monthNameEn}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Paid status button with clear labels */}
                    <button
                      onClick={() => handleUpdateRow(m.id, 'isPaid', !m.isPaid)}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-xs font-bold ${
                        m.isPaid 
                          ? 'bg-emerald-950/35 border-emerald-500/40 text-[#10B981]' 
                          : 'bg-[#10121A] border-[#1D212F] text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <Check className={`h-3.5 w-3.5 ${m.isPaid ? 'stroke-[3]' : 'stroke-[1.5]'}`} />
                      <span>{m.isPaid ? (lang === 'bn' ? 'পেইড' : 'Paid') : (lang === 'bn' ? 'আনপেইড' : 'Unpaid')}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteRow(m.id)}
                      className="p-2.5 text-slate-500 hover:text-rose-500 rounded-xl hover:bg-rose-950/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 stroke-[1.75]" />
                    </button>
                  </div>
                </div>

                {/* Card Form Inputs */}
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Full KPI Bonus */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'KPI পূর্ণ বোনাস' : 'Full KPI Bonus'}
                    </label>
                    <input
                      type="number"
                      value={m.fullKPIBonus || ''}
                      onChange={(e) => handleUpdateRow(m.id, 'fullKPIBonus', Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full bg-[#10121A] border border-[#191C26] rounded-xl px-3 py-2.5 text-sm font-bold text-slate-200 focus:border-indigo-500/80 outline-none transition-all"
                    />
                  </div>

                  {/* KPI Score */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'KPI স্কোর (%)' : 'KPI Score (%)'}
                    </label>
                    <div className="relative w-full">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="150"
                        placeholder=""
                        value={m.kpiScore === null ? '' : m.kpiScore}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateRow(m.id, 'kpiScore', val === '' ? null : Math.max(0, Math.min(150, parseFloat(val) || 0)));
                        }}
                        className="peer w-full bg-[#10121A] border border-[#191C26] rounded-xl pl-3 pr-8 py-2.5 text-sm font-bold text-slate-200 focus:border-indigo-500/80 outline-none transition-all"
                      />
                      {(m.kpiScore === null) && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 peer-focus:hidden transition-all duration-150">
                          <div className="w-[3px] h-3.5 rounded-full animate-bounce-stick" />
                          <span className="text-xs text-slate-500 font-bold">
                            {lang === 'bn' ? 'স্কোর' : 'Score'}
                          </span>
                        </div>
                      )}
                      <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Card Settings Column 2 */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  {/* Deduction State */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'কর্তন (%)' : 'Deduction (%)'}
                    </span>
                    <div className="min-h-[40px] flex items-center">
                      {!m.isPreMay && m.hasIncentive && m.kpiScore !== null && m.kpiScore >= 85 && m.kpiScore < 90 ? (
                        <span className="text-emerald-400 font-semibold bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/20 text-[10px] leading-tight inline-block">
                          {lang === 'bn' ? '৯০% ইনসেন্টিভ প্রদান করা হচ্ছে' : '90% Incentive provided'}
                        </span>
                      ) : !m.isPreMay && m.hasIncentive && m.kpiScore !== null && m.kpiScore >= 90 && m.kpiScore < 95 ? (
                        <span className="text-emerald-400 font-semibold bg-emerald-950/30 px-2 py-1 rounded-lg border border-emerald-500/20 text-[10px] leading-tight inline-block">
                          {lang === 'bn' ? '৯৫% ইনসেন্টিভ প্রদান করা হচ্ছে' : '95% Incentive provided'}
                        </span>
                      ) : m.hasIncentive && m.deductionPercent > 0 ? (
                        <span className="text-rose-500/90 text-sm font-bold">{m.deductionPercent}%</span>
                      ) : (
                        <span className="text-slate-600 text-sm font-normal">-</span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Checkbox */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {lang === 'bn' ? 'উপস্থিতি (১০০০)' : 'Attendance (1000)'}
                    </span>
                    <div className="min-h-[40px] flex items-center">
                      {m.isPreMay ? (
                        <span className="text-slate-600 text-sm font-normal">-</span>
                      ) : (
                        <label className="inline-flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={m.attendanceChecked}
                            onChange={(e) => handleUpdateRow(m.id, 'attendanceChecked', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-6 h-6 bg-[#10121A] border border-[#1B1E2B] rounded-lg flex items-center justify-center peer-checked:bg-indigo-600 peer-checked:border-indigo-500 transition-all shadow-inner">
                            {m.attendanceChecked && <Check className="h-4 w-4 text-white stroke-[3.5]" />}
                          </div>
                          <span className="text-xs text-slate-300">
                            {m.attendanceChecked ? (lang === 'bn' ? 'উপস্থিত' : 'Present') : (lang === 'bn' ? 'অনুপস্থিত' : 'Absent')}
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Month final calculation outcome */}
                <div className="bg-[#10121A] rounded-xl p-3 flex items-center justify-between border border-[#181B26]">
                  <span className="text-xs font-semibold text-slate-400">
                    {lang === 'bn' ? 'চূড়ান্ত বোনাস:' : 'Final Bonus:'}
                  </span>
                  <span className="text-sm font-black text-[#34D399]">
                    {m.finalBonus > 0 ? (
                      <span>{m.finalBonus.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-slate-600 font-normal">-</span>
                    )}
                  </span>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
      
      {/* 6. COPYRIGHT FOOTER */}
      <div className="max-w-6xl w-full mt-12 pt-6 border-t border-[#1C1F2B]/60 text-center text-orange-500/70 text-xs flex flex-col items-center justify-center gap-1.5" id="app-footer">
        <p className="text-orange-500/80 hover:text-orange-400 transition-colors">
          {lang === 'bn' 
            ? '© ২০২৬ KPI ক্যালকুলেটর। সর্বস্বত্ব সংরক্ষিত।' 
            : '© 2026 KPI Calculator. All rights reserved.'}
        </p>
        <p className="text-[10px] text-orange-600/60 font-mono tracking-wider">
          {lang === 'bn'
            ? 'ভার্সন: ২.৫.০'
            : 'Version: 2.5.0'}
        </p>
      </div>

    </div>
  );
}

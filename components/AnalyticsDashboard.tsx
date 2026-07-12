import React from 'react';
import { TeamMember, DEFAULT_BRACKETS } from '../types';
import { translations } from '../utils/translations';
import { BarChart3, PieChart, Landmark, PiggyBank, Users, Trophy } from 'lucide-react';

interface AnalyticsDashboardProps {
  lang: 'bn' | 'en';
  members: TeamMember[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  lang,
  members,
}) => {
  const t = translations[lang];

  const totalEmployees = members.length;
  const totalBase = members.reduce((sum, m) => sum + m.baseIncentive, 0);
  const totalPayout = members.reduce((sum, m) => sum + m.calculatedPayout, 0);
  const totalDeduction = members.reduce((sum, m) => sum + m.calculatedDeduction, 0);
  const avgKPI = totalEmployees > 0 
    ? members.reduce((sum, m) => sum + m.kpiScore, 0) / totalEmployees 
    : 0;

  // 1. Group members by bracket
  const bracketCounts = DEFAULT_BRACKETS.map(bracket => {
    const count = members.filter(m => m.kpiScore >= bracket.minKPI && m.kpiScore <= bracket.maxKPI).length;
    return {
      ...bracket,
      count
    };
  });

  const maxCount = Math.max(...bracketCounts.map(b => b.count), 1);

  // 2. Performance metrics
  const topPerformer = members.length > 0 
    ? [...members].sort((a, b) => b.kpiScore - a.kpiScore)[0] 
    : null;

  return (
    <div className="space-y-8" id="analytics-view">
      
      {/* ANALYTICS HEADER */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl shadow-sm">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{t.analyticsHeader}</h3>
          <p className="text-xs text-slate-400">{t.analyticsSub}</p>
        </div>
      </div>

      {/* OVERVIEW STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="analytics-stats-grid">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.totalProcessed}</span>
            <h4 className="text-xl font-black text-slate-800">{totalEmployees}</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.totalPayout}</span>
            <h4 className="text-xl font-black text-emerald-600">
              ৳ {totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.budgetRemaining}</span>
            <h4 className="text-xl font-black text-rose-500">
              ৳ {totalDeduction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.averageKPI}</span>
            <h4 className="text-xl font-black text-slate-800">{avgKPI.toFixed(1)}%</h4>
          </div>
        </div>
      </div>

      {/* CHART PLOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="analytics-charts">
        
        {/* BUDGET ALLOCATION BAR CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <PieChart className="h-4.5 w-4.5 text-emerald-600" />
              {t.budgetBreakdown}
            </h4>
            <p className="text-[11px] text-slate-400 mb-6">
              {lang === 'bn' ? 'মোট বরাদ্দকৃত ইনসেন্টিভ বাজেটের প্রদেয় বনাম সাশ্রয়কৃত রূপরেখা' : 'Breakdown of earned budget, final payout, and deduction savings.'}
            </p>
          </div>

          {totalEmployees === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-medium">
              {lang === 'bn' ? 'কোনো কর্মচারী যুক্ত করা হয়নি। অনুগ্রহ করে টিম শিটে যুক্ত করুন।' : 'Add employees to visualize budget allocation.'}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Custom SVG/HTML Bar Chart */}
              <div className="space-y-4">
                {/* Total Base Budget Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>{t.chartBase}</span>
                    <span className="font-mono text-slate-700">৳ {totalBase.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Final Payout Budget Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>{t.chartPayout}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        {((totalPayout / totalBase) * 100).toFixed(1)}%
                      </span>
                      <span className="font-mono text-emerald-600 font-bold">৳ {totalPayout.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(totalPayout / totalBase) * 100}%` }} />
                  </div>
                </div>

                {/* Savings/Deductions Budget Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>{t.chartDeduction}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        {((totalDeduction / totalBase) * 100).toFixed(1)}%
                      </span>
                      <span className="font-mono text-rose-500 font-bold">৳ {totalDeduction.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${(totalDeduction / totalBase) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-bold uppercase text-center pt-4 border-t border-slate-50">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-slate-400 rounded-full mb-1" />
                  <span>{t.chartBase}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mb-1" />
                  <span>{t.chartPayout}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full mb-1" />
                  <span>{t.chartDeduction}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BRACKET DISTRIBUTION HORIZONTAL CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <PieChart className="h-4.5 w-4.5 text-indigo-600" />
            {t.bracketDistribution}
          </h4>
          <p className="text-[11px] text-slate-400 mb-6">
            {lang === 'bn' ? 'শর্ত অনুযায়ী বিভিন্ন KPI স্তরে কর্মচারীদের বিন্যাস' : 'Number of employees matching each KPI policy bracket.'}
          </p>

          {totalEmployees === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400 font-medium">
              {lang === 'bn' ? 'কোনো কর্মচারী যুক্ত করা হয়নি। অনুগ্রহ করে টিম শিটে যুক্ত করুন।' : 'Add employees to view distribution.'}
            </div>
          ) : (
            <div className="space-y-4">
              {bracketCounts.map(bracket => {
                const percent = (bracket.count / maxCount) * 100;
                
                return (
                  <div key={bracket.id} className="space-y-1" id={`dist-bar-${bracket.id}`}>
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span className="text-slate-600 font-semibold truncate max-w-[280px]">
                        {lang === 'bn' ? bracket.labelBn : bracket.labelEn}
                      </span>
                      <span className="font-bold text-slate-800 shrink-0">
                        {bracket.count} {lang === 'bn' ? 'জন' : (bracket.count === 1 ? 'employee' : 'employees')}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden flex items-center">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          bracket.color === 'red' ? 'bg-rose-500' :
                          bracket.color === 'orange' ? 'bg-orange-500' :
                          bracket.color === 'amber' ? 'bg-amber-500' :
                          bracket.color === 'blue' ? 'bg-blue-500' :
                          bracket.color === 'indigo' ? 'bg-indigo-500' :
                          bracket.color === 'emerald' ? 'bg-emerald-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* TOP PERFORMERS & BONUS STATS CARD */}
      {members.length > 0 && topPerformer && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-300 fill-yellow-300 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
                {lang === 'bn' ? 'সর্বোচ্চ পারফর্মার (Top Performer)' : 'Highest Performer'}
              </span>
            </div>
            <h3 className="text-xl font-black">{topPerformer.name}</h3>
            <p className="text-xs text-emerald-100 mt-1">
              {lang === 'bn' 
                ? `KPI স্কোর: ${topPerformer.kpiScore}% | মোট প্রদেয় ইনসেন্টিভ: ৳ ${topPerformer.calculatedPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                : `KPI Score: ${topPerformer.kpiScore}% | Total Final Payout: ৳ ${topPerformer.calculatedPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              }
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-xl text-center self-stretch md:self-auto flex flex-col justify-center">
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">{lang === 'bn' ? 'চূড়ান্ত প্রাপ্য হার' : 'Final Payout Rate'}</span>
            <span className="text-2xl font-black mt-0.5">{topPerformer.payoutPercent}%</span>
          </div>
        </div>
      )}

    </div>
  );
};

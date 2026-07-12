import React from 'react';
import { KPIBracket, DEFAULT_BRACKETS } from '../types';
import { translations } from '../utils/translations';
import { Play, ShieldAlert, BadgePercent, CheckCircle, Info } from 'lucide-react';

interface RulesTableProps {
  lang: 'bn' | 'en';
  currentKPI?: number;
  onSelectKPIBracket?: (kpiMidpoint: number) => void;
}

export const RulesTable: React.FC<RulesTableProps> = ({
  lang,
  currentKPI = -1,
  onSelectKPIBracket,
}) => {
  const t = translations[lang];

  const getStatusBadge = (bracket: KPIBracket) => {
    switch (bracket.id) {
      case 'bracket-1':
        return {
          icon: ShieldAlert,
          bg: 'bg-rose-50 text-rose-700 border-rose-100',
          label: lang === 'bn' ? t.below70 : t.below70,
        };
      case 'bracket-2':
        return {
          icon: BadgePercent,
          bg: 'bg-orange-50 text-orange-700 border-orange-100',
          label: lang === 'bn' ? t.deduct10 : t.deduct10,
        };
      case 'bracket-3':
        return {
          icon: BadgePercent,
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          label: lang === 'bn' ? t.deduct5 : t.deduct5,
        };
      case 'bracket-4':
        return {
          icon: CheckCircle,
          bg: 'bg-blue-50 text-blue-700 border-blue-100',
          label: lang === 'bn' ? t.fullPayout : t.fullPayout,
        };
      case 'bracket-5':
        return {
          icon: BadgePercent,
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          label: lang === 'bn' ? t.payout90 : t.payout90,
        };
      case 'bracket-6':
        return {
          icon: BadgePercent,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          label: lang === 'bn' ? t.payout95 : t.payout95,
        };
      case 'bracket-7':
        return {
          icon: CheckCircle,
          bg: 'bg-teal-50 text-teal-700 border-teal-100',
          label: lang === 'bn' ? t.fullPayout : t.fullPayout,
        };
      default:
        return {
          icon: Info,
          bg: 'bg-slate-50 text-slate-700 border-slate-100',
          label: '',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="rules-card">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Info className="h-5 w-5 text-emerald-600" />
          {t.rulesHeader}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {t.rulesSub}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="rules-matrix-table">
          <thead>
            <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-medium text-xs">
              <th className="py-3.5 px-6 font-semibold">{t.ruleKPIBracket}</th>
              <th className="py-3.5 px-4 font-semibold text-center">{t.ruleIncentivePct}</th>
              <th className="py-3.5 px-4 font-semibold text-center">{t.ruleDeductionPct}</th>
              <th className="py-3.5 px-6 font-semibold">{t.ruleStatus}</th>
              {onSelectKPIBracket && (
                <th className="py-3.5 px-6 font-semibold text-right">{t.clickToFill}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {DEFAULT_BRACKETS.map((bracket) => {
              const isActive = currentKPI >= bracket.minKPI && currentKPI <= bracket.maxKPI;
              const badge = getStatusBadge(bracket);
              const BadgeIcon = badge.icon;
              
              // Find midpoint to set as template
              const midpoint = bracket.maxKPI === 999 
                ? 97.5 
                : bracket.minKPI === 0 
                  ? 65 
                  : parseFloat(((bracket.minKPI + bracket.maxKPI) / 2).toFixed(2));

              return (
                <tr
                  key={bracket.id}
                  className={`transition-all duration-150 ${
                    isActive 
                      ? 'bg-emerald-50/50 hover:bg-emerald-50 border-l-4 border-l-emerald-600' 
                      : 'hover:bg-slate-50/50'
                  }`}
                  id={`rule-row-${bracket.id}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        bracket.color === 'red' ? 'bg-rose-500' :
                        bracket.color === 'orange' ? 'bg-orange-500' :
                        bracket.color === 'amber' ? 'bg-amber-500' :
                        bracket.color === 'blue' ? 'bg-blue-500' :
                        bracket.color === 'indigo' ? 'bg-indigo-500' :
                        bracket.color === 'emerald' ? 'bg-emerald-500' : 'bg-teal-500'
                      }`} />
                      <span className="font-semibold text-slate-700">
                        {bracket.minKPI === 0 
                          ? (lang === 'bn' ? '৭০% এর কম' : 'Below 70%')
                          : bracket.maxKPI === 999
                            ? (lang === 'bn' ? '৯৫% বা তার বেশি' : '95% or higher')
                            : `${bracket.minKPI}% - ${bracket.maxKPI}%`
                        }
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-slate-800">
                    {bracket.payoutPercent}%
                  </td>
                  <td className="py-4 px-4 text-center font-medium text-slate-500">
                    <span className={bracket.deductionPercent > 0 ? 'text-rose-500 font-semibold' : ''}>
                      {bracket.deductionPercent}%
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.bg}`}>
                      <BadgeIcon className="h-3.5 w-3.5" />
                      {badge.label}
                    </span>
                  </td>
                  {onSelectKPIBracket && (
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onSelectKPIBracket(midpoint)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title={`${midpoint}% টেস্ট করুন`}
                        id={`rule-fill-btn-${bracket.id}`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>{midpoint}%</span>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <span className="font-medium flex items-center gap-1.5 text-slate-500">
          <Info className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          {t.sourceNotice}
        </span>
        <span className="text-slate-400 italic">
          {t.disclaimer}
        </span>
      </div>
    </div>
  );
};

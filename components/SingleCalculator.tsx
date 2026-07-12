import React, { useState, useEffect } from 'react';
import { calculateIncentive, TeamMember } from '../types';
import { translations } from '../utils/translations';
import { 
  Calculator, 
  User, 
  Briefcase, 
  CircleDollarSign, 
  Sliders, 
  RefreshCw, 
  Plus, 
  Printer, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

interface SingleCalculatorProps {
  lang: 'bn' | 'en';
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  initialKPI?: number;
}

export const SingleCalculator: React.FC<SingleCalculatorProps> = ({
  lang,
  onAddMember,
  initialKPI,
}) => {
  const t = translations[lang];

  // Component States
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [baseIncentive, setBaseIncentive] = useState<number>(15000);
  const [kpiScore, setKpiScore] = useState<number>(95);

  // Sync if initialKPI changes (e.g. from clicking on the rules table midpoint)
  useEffect(() => {
    if (initialKPI !== undefined && initialKPI >= 0) {
      setKpiScore(initialKPI);
    }
  }, [initialKPI]);

  // Run calculation
  const result = calculateIncentive(kpiScore, baseIncentive);

  // Form Reset
  const handleReset = () => {
    setName('');
    setEmpId('');
    setBaseIncentive(15000);
    setKpiScore(95);
  };

  // Add to Team Sheet callback
  const handleAddToSheet = () => {
    onAddMember({
      name: name.trim() || (lang === 'bn' ? 'বেনামী কর্মচারী' : 'Unnamed Employee'),
      employeeId: empId.trim() || undefined,
      baseIncentive,
      kpiScore,
      calculatedPayout: result.payoutAmount,
      calculatedDeduction: result.deductionAmount,
      payoutPercent: result.payoutPercent,
      bracketLabel: lang === 'bn' ? result.bracket?.labelBn || '' : result.bracket?.labelEn || '',
    });
    
    // Quick notification or feedback, let's reset the name/empId for next entry but keep the values
    setName('');
    setEmpId('');
  };

  // Browser Print Utility for single calculation report
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>${t.appTitle} - Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #334155; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #0f172a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; rounded: 8px; }
            .card-title { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 5px; font-weight: 600; }
            .card-value { font-size: 20px; font-weight: bold; color: #0f172a; }
            .amount-payout { color: #10b981; }
            .amount-deduction { color: #f43f5e; }
            .explanation { font-size: 16px; font-weight: 500; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin-bottom: 30px; }
            .rule-tag { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${lang === 'bn' ? 'কেপিআই ইনসেন্টিভ রিপোর্ট' : 'KPI Incentive Calculation Report'}</div>
            <div class="subtitle">Date: ${new Date().toLocaleDateString()} | Ref: ${empId || 'N/A'}</div>
          </div>
          
          <div style="margin-bottom: 25px;">
            <strong>${lang === 'bn' ? 'কর্মচারীর নাম' : 'Employee Name'}:</strong> ${name || (lang === 'bn' ? 'বেনামী কর্মচারী' : 'Unnamed Employee')} <br/>
            <strong>${lang === 'bn' ? 'কর্মচারী আইডি' : 'Employee ID'}:</strong> ${empId || 'N/A'}
          </div>

          <div class="explanation">
            ${lang === 'bn' ? result.explanationBn : result.explanationEn}
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">${lang === 'bn' ? 'অর্জিত ইনসেন্টিভ পরিমাণ' : 'Base Earned Incentive'}</div>
              <div class="card-value">৳ ${baseIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="card">
              <div class="card-title">${lang === 'bn' ? 'কেপিআই (KPI) স্কোর' : 'KPI Achievement Score'}</div>
              <div class="card-value">${kpiScore}%</div>
            </div>
            <div class="card" style="border-left: 4px solid #10b981;">
              <div class="card-title">${lang === 'bn' ? 'চূড়ান্ত প্রাপ্য ইনসেন্টিভ' : 'Final Payable Amount'} (${result.payoutPercent}%)</div>
              <div class="card-value amount-payout">৳ ${result.payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="card" style="border-left: 4px solid #f43f5e;">
              <div class="card-title">${lang === 'bn' ? 'কর্তনকৃত পরিমাণ' : 'Deducted Amount'} (${result.deductionPercent}%)</div>
              <div class="card-value amount-deduction">৳ ${result.deductionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div>
            <span class="rule-tag">
              ${lang === 'bn' ? 'সক্রিয় নিয়ম: ' + (result.bracket?.labelBn || '') : 'Active Rule: ' + (result.bracket?.labelEn || '')}
            </span>
          </div>

          <div class="footer">
            ${lang === 'bn' ? 'এই রিপোর্টটি অটোমেটিক সিস্টেমে জেনারেট করা হয়েছে।' : 'This report was automatically generated by the KPI Incentive system.'}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  // Color mapping based on KPI brackets
  const getScoreColor = (score: number) => {
    if (score < 70) return 'text-rose-500';
    if (score < 80) return 'text-amber-500';
    if (score < 85) return 'text-blue-500';
    if (score < 95) return 'text-indigo-500';
    return 'text-teal-500';
  };

  const getScoreBg = (score: number) => {
    if (score < 70) return 'from-rose-500 to-red-600';
    if (score < 80) return 'from-amber-500 to-orange-500';
    if (score < 85) return 'from-blue-500 to-cyan-500';
    if (score < 95) return 'from-indigo-500 to-purple-500';
    return 'from-emerald-500 to-teal-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="single-calculator-view">
      
      {/* INPUT FORM CARD */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between" id="single-calc-inputs">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{t.singleCalcHeader}</h3>
                <p className="text-xs text-slate-400">{t.singleCalcSub}</p>
              </div>
            </div>
            
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              title={t.resetBtn}
              id="reset-form-btn"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Employee Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {t.employeeName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.employeeNamePlaceholder}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                id="input-employee-name"
              />
            </div>

            {/* Employee ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                {t.employeeId}
              </label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder={t.employeeIdPlaceholder}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                id="input-employee-id"
              />
            </div>

            {/* Base Incentive */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <CircleDollarSign className="h-3.5 w-3.5 text-slate-400" />
                {t.baseIncentive}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-400 font-semibold text-sm">৳</span>
                <input
                  type="number"
                  min="0"
                  value={baseIncentive || ''}
                  onChange={(e) => setBaseIncentive(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-8 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                  id="input-base-incentive"
                />
              </div>
            </div>

            {/* KPI Score Input & Slider */}
            <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                  {t.kpiScore}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="150"
                    step="0.01"
                    value={kpiScore}
                    onChange={(e) => setKpiScore(Math.min(150, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-20 px-2 py-1 text-right text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                    id="input-kpi-score-numeric"
                  />
                  <span className="text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="50"
                max="105"
                step="0.1"
                value={kpiScore}
                onChange={(e) => setKpiScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                id="input-kpi-score-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                <span>50%</span>
                <span>70%</span>
                <span>80%</span>
                <span>90%</span>
                <span>100%</span>
                <span>105%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-8 pt-4 border-t border-slate-50">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-sm active:scale-95"
            id="print-report-btn"
          >
            <Printer className="h-4 w-4" />
            <span>{t.exportReport}</span>
          </button>

          <button
            onClick={handleAddToSheet}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            id="add-member-btn"
          >
            <Plus className="h-4 w-4" />
            <span>{t.addMember}</span>
          </button>
        </div>
      </div>

      {/* RESULTS/SUMMARY PANEL */}
      <div className="lg:col-span-5 flex flex-col gap-6" id="single-calc-results">
        
        {/* BIG VISUAL GAUGE CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getScoreBg(kpiScore)}`} />
          
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.kpiScore}
          </span>

          <div className="relative flex items-center justify-center h-36 w-36 mb-4">
            {/* Circular Track Background */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="stroke-slate-100"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Colored Indicator Fill */}
              <circle
                cx="72"
                cy="72"
                r="64"
                className="transition-all duration-300 ease-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - Math.min(100, kpiScore) / 100)}`}
                strokeLinecap="round"
                stroke={`url(#gauge-gradient)`}
              />
              <defs>
                <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center score */}
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-extrabold tracking-tight ${getScoreColor(kpiScore)}`}>
                {kpiScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                KPI Score
              </span>
            </div>
          </div>

          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            kpiScore < 70 ? 'bg-rose-50 text-rose-700' :
            kpiScore < 80 ? 'bg-orange-50 text-orange-700' :
            kpiScore < 85 ? 'bg-blue-50 text-blue-700' :
            kpiScore < 95 ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
          }`}>
            {lang === 'bn' ? result.bracket?.labelBn : result.bracket?.labelEn}
          </span>
        </div>

        {/* FINANCIAL SUMMARY BREAKDOWN CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t.resultSummary}
          </h4>

          {/* Explanation Text */}
          <div className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${
            result.deductionPercent > 0 
              ? 'bg-amber-50/50 text-amber-800 border-amber-100' 
              : 'bg-emerald-50/50 text-emerald-800 border-emerald-100'
          }`}>
            {result.deductionPercent > 0 ? (
              <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            <p className="font-medium">
              {lang === 'bn' ? result.explanationBn : result.explanationEn}
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            {/* Earned base */}
            <div className="py-3 flex justify-between items-center">
              <span className="text-slate-500 font-medium">{t.baseIncentive}</span>
              <span className="font-semibold text-slate-700">
                ৳ {baseIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Payout % & Amount */}
            <div className="py-3 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">{t.payoutRate}</span>
                <span className="text-[10px] text-slate-400">({t.finalIncentive} %)</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100 mr-2">
                  {result.payoutPercent}%
                </span>
                <span className="font-bold text-emerald-600">
                  ৳ {result.payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Deduction % & Amount */}
            <div className="py-3 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-slate-500 font-medium">{t.deductionRate}</span>
                <span className="text-[10px] text-slate-400">({t.deductedAmount} %)</span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border mr-2 ${
                  result.deductionPercent > 0 
                    ? 'bg-rose-50 text-rose-700 border-rose-100' 
                    : 'bg-slate-50 text-slate-500 border-slate-100'
                }`}>
                  {result.deductionPercent}%
                </span>
                <span className={`font-bold ${result.deductionPercent > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                  ৳ {result.deductionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Final Receivable (Grand Highlight) */}
            <div className="py-4 flex justify-between items-center border-t border-slate-200">
              <span className="text-slate-800 font-bold text-base">{t.finalIncentive}</span>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  ৳ {result.payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                  {lang === 'bn' ? '*মোট কর্তন শেষে প্রদেয় পরিমাণ' : '*Net receivable amount after cuts'}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

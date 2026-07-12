import React, { useState } from 'react';
import { TeamMember, calculateIncentive } from '../types';
import { translations } from '../utils/translations';
import { 
  Users, 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  ChevronRight, 
  Upload, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface MultiCalculatorProps {
  lang: 'bn' | 'en';
  members: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
  onClearAll: () => void;
  onImportCSV?: (data: Array<{ name: string; employeeId?: string; baseIncentive: number; kpiScore: number }>) => void;
}

export const MultiCalculator: React.FC<MultiCalculatorProps> = ({
  lang,
  members,
  onAddMember,
  onDeleteMember,
  onClearAll,
}) => {
  const t = translations[lang];

  // Form states for inline quick add
  const [name, setName] = useState('');
  const [empId, setEmpId] = useState('');
  const [baseIncentive, setBaseIncentive] = useState<number>(12000);
  const [kpiScore, setKpiScore] = useState<number>(90);
  
  // CSV paste/import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvPasteText, setCsvPasteText] = useState('');
  const [importError, setImportError] = useState('');

  // Calculations for Team Summary
  const totalEmployees = members.length;
  const totalBaseIncentive = members.reduce((sum, m) => sum + m.baseIncentive, 0);
  const totalPayout = members.reduce((sum, m) => sum + m.calculatedPayout, 0);
  const totalDeduction = members.reduce((sum, m) => sum + m.calculatedDeduction, 0);
  const avgKPI = totalEmployees > 0 
    ? members.reduce((sum, m) => sum + m.kpiScore, 0) / totalEmployees 
    : 0;

  // Submit Quick Add
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateIncentive(kpiScore, baseIncentive);
    onAddMember({
      name: name.trim() || (lang === 'bn' ? `কর্মচারী ${members.length + 1}` : `Employee ${members.length + 1}`),
      employeeId: empId.trim() || undefined,
      baseIncentive,
      kpiScore,
      calculatedPayout: result.payoutAmount,
      calculatedDeduction: result.deductionAmount,
      payoutPercent: result.payoutPercent,
      bracketLabel: lang === 'bn' ? result.bracket?.labelBn || '' : result.bracket?.labelEn || '',
    });
    setName('');
    setEmpId('');
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    if (members.length === 0) return;
    
    // Construct CSV Header
    const headers = lang === 'bn' 
      ? ['নং', 'নাম', 'আইডি', 'অর্জিত ইনসেন্টিভ (টাকা)', 'KPI স্কোর (%)', 'প্রাপ্য ইনসেন্টিভ হার (%)', 'চূড়ান্ত প্রদেয় ইনসেন্টিভ (টাকা)', 'কর্তনকৃত টাকা (টাকা)', 'শর্তাবলী ব্র্যাকেট']
      : ['SL', 'Name', 'ID', 'Earned Incentive (BDT)', 'KPI Score (%)', 'Payout Rate (%)', 'Final Payout (BDT)', 'Deduction Amount (BDT)', 'Rule Bracket'];

    const rows = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.employeeId || 'N/A',
      m.baseIncentive,
      m.kpiScore,
      m.payoutPercent,
      m.calculatedPayout,
      m.calculatedDeduction,
      m.bracketLabel
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Incentive_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser Print for Multi-employee sheet
  const handlePrintSheet = () => {
    const tableRows = members.map((m, idx) => `
      <tr>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px;">
          <strong>${m.name}</strong><br/>
          <small style="color: #64748b;">${m.employeeId || 'N/A'}</small>
        </td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">৳ ${m.baseIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${m.kpiScore}%</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${m.payoutPercent}%</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold; color: #10b981;">৳ ${m.calculatedPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #f43f5e;">৳ ${m.calculatedDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; font-size: 11px;">${m.bracketLabel}</td>
      </tr>
    `).join('');

    const printContent = `
      <html>
        <head>
          <title>${t.appTitle} - Team Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #334155; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
            .title { font-size: 22px; font-weight: bold; color: #0f172a; }
            .stats-bar { display: flex; gap: 30px; margin-bottom: 25px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            .stat-box { flex: 1; }
            .stat-title { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 3px; font-weight: 600; }
            .stat-value { font-size: 16px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th { background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px 10px; font-weight: bold; text-align: left; }
            td { border: 1px solid #cbd5e1; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${lang === 'bn' ? 'টিম ইনসেন্টিভ হিসাব বিবরণী' : 'Team Incentive Calculation Sheet'}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Generated: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="stats-bar">
            <div class="stat-box">
              <div class="stat-title">${lang === 'bn' ? 'মোট কর্মচারী' : 'Total Employees'}</div>
              <div class="stat-value">${totalEmployees}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">${lang === 'bn' ? 'মোট অর্জিত ইনসেন্টিভ' : 'Total Base Budget'}</div>
              <div class="stat-value">৳ ${totalBaseIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">${lang === 'bn' ? 'মোট প্রদেয় ইনসেন্টিভ' : 'Total Final Payout'}</div>
              <div class="stat-value" style="color: #10b981;">৳ ${totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">${lang === 'bn' ? 'মোট সাশ্রয় (কর্তন)' : 'Total Budget Savings'}</div>
              <div class="stat-value" style="color: #f43f5e;">৳ ${totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">${lang === 'bn' ? 'গড় KPI স্কোর' : 'Average KPI'}</div>
              <div class="stat-value">${avgKPI.toFixed(2)}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">${lang === 'bn' ? 'নং' : 'SL'}</th>
                <th style="width: 20%;">${lang === 'bn' ? 'কর্মচারীর নাম ও আইডি' : 'Employee Details'}</th>
                <th style="width: 15%; text-align: right;">${lang === 'bn' ? 'অর্জিত বাজেট (৳)' : 'Base Earned (৳)'}</th>
                <th style="width: 10%; text-align: center;">${lang === 'bn' ? 'KPI স্কোর' : 'KPI Score'}</th>
                <th style="width: 10%; text-align: center;">${lang === 'bn' ? 'প্রাপ্য হার (%)' : 'Payable %'}</th>
                <th style="width: 15%; text-align: right;">${lang === 'bn' ? 'চূড়ান্ত প্রদেয় (৳)' : 'Final Payout (৳)'}</th>
                <th style="width: 15%; text-align: right;">${lang === 'bn' ? 'কর্তনকৃত পরিমাণ (৳)' : 'Deducted (৳)'}</th>
                <th style="width: 10%;">${lang === 'bn' ? 'সক্রিয় শর্ত' : 'Active Rule'}</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            ${lang === 'bn' ? 'এটি একটি কম্পিউটার জেনারেটেড বিবরণী এবং কোনো সই ছাড়াই বৈধ।' : 'This sheet is computer generated and valid without signatures.'}
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

  // Handle CSV Paste text submission
  const handleCSVImportSubmit = () => {
    try {
      if (!csvPasteText.trim()) {
        setImportError('Please paste some CSV data first.');
        return;
      }

      const lines = csvPasteText.split('\n');
      const importedData: Array<{ name: string; employeeId?: string; baseIncentive: number; kpiScore: number }> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip potential header rows
        if (i === 0 && (line.toLowerCase().includes('name') || line.includes('নাম') || line.toLowerCase().includes('kpi'))) {
          continue;
        }

        // Split by comma or tab (TSV support is awesome!)
        const parts = line.split(/[,\t]/);
        if (parts.length < 2) continue;

        const rawName = parts[0]?.replace(/^["']|["']$/g, '').trim() || '';
        const rawId = parts.length > 2 ? parts[1]?.replace(/^["']|["']$/g, '').trim() : '';
        
        // Base incentive parser (strip currency symbols and commas)
        const rawBaseStr = parts.length > 2 ? parts[2] : parts[1];
        const rawBase = parseFloat(rawBaseStr?.replace(/[^\d.]/g, '') || '0') || 0;

        // KPI parser (strip % signs)
        const rawKPIStr = parts.length > 2 ? parts[3] : parts[2];
        const rawKPI = parseFloat(rawKPIStr?.replace(/[^\d.]/g, '') || '0') || 0;

        if (rawName && rawBase >= 0 && rawKPI >= 0) {
          importedData.push({
            name: rawName,
            employeeId: rawId || undefined,
            baseIncentive: rawBase,
            kpiScore: rawKPI
          });
        }
      }

      if (importedData.length === 0) {
        setImportError('Could not parse any valid employee data. Ensure format is: Name, [ID], EarnedIncentive, KPIScore');
        return;
      }

      // Add each parsed employee
      importedData.forEach(item => {
        const result = calculateIncentive(item.kpiScore, item.baseIncentive);
        onAddMember({
          name: item.name,
          employeeId: item.employeeId,
          baseIncentive: item.baseIncentive,
          kpiScore: item.kpiScore,
          calculatedPayout: result.payoutAmount,
          calculatedDeduction: result.deductionAmount,
          payoutPercent: result.payoutPercent,
          bracketLabel: lang === 'bn' ? result.bracket?.labelBn || '' : result.bracket?.labelEn || '',
        });
      });

      // Clear states
      setCsvPasteText('');
      setImportError('');
      setShowImportModal(false);
    } catch (err: any) {
      setImportError(`Parsing Error: ${err.message || 'Check format'}`);
    }
  };

  return (
    <div className="space-y-6" id="team-sheet-view">
      
      {/* QUICK INLINE ADD FORM CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Users className="h-4.5 w-4.5 text-emerald-600" />
          {t.addMember}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end" id="quick-add-form">
          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t.employeeName}</label>
            <input
              type="text"
              required
              placeholder={t.employeeNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
              id="quick-add-name"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t.employeeId}</label>
            <input
              type="text"
              placeholder={t.employeeIdPlaceholder}
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none"
              id="quick-add-id"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t.baseIncentive}</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-semibold text-xs">৳</span>
              <input
                type="number"
                min="0"
                required
                value={baseIncentive || ''}
                onChange={(e) => setBaseIncentive(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-6 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-semibold text-slate-700"
                id="quick-add-base"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">{t.kpiScore}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="150"
                step="0.1"
                required
                value={kpiScore}
                onChange={(e) => setKpiScore(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pr-6 pl-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-bold text-slate-700"
                id="quick-add-kpi"
              />
              <span className="absolute right-3 top-2 text-slate-400 font-bold text-xs">%</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5"
              id="quick-add-submit-btn"
            >
              <Plus className="h-4 w-4" />
              <span>{t.calculateBtn}</span>
            </button>
          </div>
        </form>
      </div>

      {/* BULK ACTION CONTROLS */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {lang === 'bn' ? `তালিকায় মোট: ${totalEmployees} জন` : `Total items: ${totalEmployees}`}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2" id="bulk-action-buttons">
          {/* Paste CSV Trigger */}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-sm transition-all"
            id="open-csv-import-modal-btn"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{t.bulkImport}</span>
          </button>

          {members.length > 0 && (
            <>
              {/* Export CSV */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm transition-all"
                id="export-csv-btn"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.exportCsv}</span>
              </button>

              {/* Print sheet */}
              <button
                onClick={handlePrintSheet}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm transition-all"
                id="print-sheet-btn"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>{t.printFriendly}</span>
              </button>

              {/* Clear All */}
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg shadow-sm transition-all"
                id="clear-all-btn"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.clearAll}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* SPREADSHEET DATAGRID */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="team-sheet-table-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="team-sheet-data-table">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold text-xs">
                <th className="py-3 px-4 text-center w-12">{t.tableNo}</th>
                <th className="py-3 px-4 min-w-[180px]">{t.tableName}</th>
                <th className="py-3 px-4 text-right">{t.tableBase}</th>
                <th className="py-3 px-4 text-center">{t.tableKPI}</th>
                <th className="py-3 px-4 text-center">{t.tablePayoutPercent}</th>
                <th className="py-3 px-4 text-right">{t.tablePayout}</th>
                <th className="py-3 px-4 text-right">{t.tableDeduction}</th>
                <th className="py-3 px-4 min-w-[150px]">{t.tableBracket}</th>
                <th className="py-3 px-4 text-center w-16">{t.tableActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-slate-300 stroke-[1.5]" />
                      <p className="text-xs">{t.noMembers}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-all duration-100" id={`member-row-${member.id}`}>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 leading-tight">{member.name}</span>
                        {member.employeeId && (
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold mt-0.5">
                            {member.employeeId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-600">
                      ৳ {member.baseIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{member.kpiScore}%</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-600">{member.payoutPercent}%</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      ৳ {member.calculatedPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-rose-500">
                      {member.calculatedDeduction > 0 ? `৳ ${member.calculatedDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '৳ 0.00'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-medium">{member.bracketLabel}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete Employee'}
                        id={`delete-member-btn-${member.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Sheet Footer Summation */}
            {members.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/75 border-t border-slate-200 font-bold text-xs text-slate-700">
                  <td colSpan={2} className="py-4 px-4 text-right uppercase tracking-wider">{lang === 'bn' ? 'সর্বমোট (Totals):' : 'Totals:'}</td>
                  <td className="py-4 px-4 text-right font-mono">
                    ৳ {totalBaseIncentive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-center font-sans">
                    {lang === 'bn' ? `গড়: ${avgKPI.toFixed(1)}%` : `Avg: ${avgKPI.toFixed(1)}%`}
                  </td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-600">
                    ৳ {totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-rose-500">
                    ৳ {totalDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="py-4 px-4"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* EXCEL BULK PASTE IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                {lang === 'bn' ? 'এক্সেল বা সিএসভি থেকে বাল্ক ইমপোর্ট' : 'Bulk Import from Excel / CSV'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn' 
                  ? 'আপনার এক্সেল শিট থেকে কলাম কপি করে নিচে পেস্ট করুন। ফরম্যাট: নাম, আইডি, অর্জিত ইনসেন্টিভ, কেপিআই স্কোর'
                  : 'Copy columns from your Excel spreadsheet and paste them below. Format: Name, EmployeeID, EarnedIncentive, KPIScore'
                }
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-[11px] bg-slate-50 text-slate-600 rounded-lg p-3 border border-slate-100 space-y-1">
                <p className="font-bold flex items-center gap-1 text-slate-700">
                  <AlertCircle className="h-3.5 w-3.5 text-indigo-500" />
                  {lang === 'bn' ? 'উদাহরণ ফরম্যাট (পছন্দনীয়):' : 'Example format:'}
                </p>
                <code className="block font-mono bg-white p-1.5 rounded border text-[10px] select-all leading-relaxed">
                  Asif Rahman, EMP-101, 15000, 92.5<br/>
                  Tanvir Islam, EMP-102, 18000, 78.2<br/>
                  Sadia Jahan, EMP-103, 12000, 96.0
                </code>
              </div>

              {importError && (
                <div className="text-xs bg-rose-50 text-rose-700 p-2.5 rounded-lg border border-rose-100 font-medium">
                  {importError}
                </div>
              )}

              <textarea
                value={csvPasteText}
                onChange={(e) => setCsvPasteText(e.target.value)}
                placeholder={lang === 'bn' ? 'এখানে ডেটা পেস্ট করুন...' : 'Paste your Excel data here (comma or tab separated)...'}
                rows={6}
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                id="csv-paste-textarea"
              />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-all"
                id="close-import-modal-btn"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleCSVImportSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                id="submit-csv-import-btn"
              >
                {lang === 'bn' ? 'ইমপোর্ট করুন' : 'Import Employees'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

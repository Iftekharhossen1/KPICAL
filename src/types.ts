export interface KPIBracket {
  id: string;
  minKPI: number;
  maxKPI: number; // Use standard number, e.g. 74.99
  payoutPercent: number; // e.g. 90 for 90%
  deductionPercent: number; // e.g. 10 for 10%
  labelBn: string;
  labelEn: string;
  color: string; // Tailwind class color for badges/borders
}

export interface TeamMember {
  id: string;
  name: string;
  employeeId?: string;
  baseIncentive: number;
  kpiScore: number;
  calculatedPayout: number;
  calculatedDeduction: number;
  payoutPercent: number;
  bracketLabel: string;
}

export interface CalculationResult {
  kpiScore: number;
  baseIncentive: number;
  payoutPercent: number;
  deductionPercent: number;
  payoutAmount: number;
  deductionAmount: number;
  bracket: KPIBracket | null;
  explanationBn: string;
  explanationEn: string;
}

// Default brackets as defined by the user
export const DEFAULT_BRACKETS: KPIBracket[] = [
  {
    id: 'bracket-1',
    minKPI: 0,
    maxKPI: 69.99,
    payoutPercent: 0,
    deductionPercent: 100,
    labelBn: '৭০% এর নিচে (কোনো ইনসেন্টিভ নেই)',
    labelEn: 'Below 70% (No Incentive)',
    color: 'red',
  },
  {
    id: 'bracket-2',
    minKPI: 70,
    maxKPI: 74.99,
    payoutPercent: 90,
    deductionPercent: 10,
    labelBn: '৭০% - ৭৪.৯৯% (১০% কাটা যাবে)',
    labelEn: '70% - 74.99% (10% Deduction)',
    color: 'orange',
  },
  {
    id: 'bracket-3',
    minKPI: 75,
    maxKPI: 79.99,
    payoutPercent: 95,
    deductionPercent: 5,
    labelBn: '৭৫% - ৭৯.৯৯% (৫% কাটা যাবে)',
    labelEn: '75% - 79.99% (5% Deduction)',
    color: 'amber',
  },
  {
    id: 'bracket-4',
    minKPI: 80,
    maxKPI: 84.99,
    payoutPercent: 100,
    deductionPercent: 0,
    labelBn: '৮০% - ৮৪.৯৯% (১০০% ইনসেন্টিভ)',
    labelEn: '80% - 84.99% (100% Payout)',
    color: 'blue',
  },
  {
    id: 'bracket-5',
    minKPI: 85,
    maxKPI: 89.99, // User specified "৮৫%-৮৯%" which maps to 85%-89.99% before the next tier starts at 90%
    payoutPercent: 90,
    deductionPercent: 10,
    labelBn: '৮৫% - ৮৯% (৯০% ইনসেন্টিভ)',
    labelEn: '85% - 89% (90% Payout)',
    color: 'indigo',
  },
  {
    id: 'bracket-6',
    minKPI: 90,
    maxKPI: 94.99,
    payoutPercent: 95,
    deductionPercent: 5,
    labelBn: '৯০% - ৯৪.৯৯% (৯৫% ইনসেন্টিভ)',
    labelEn: '90% - 94.99% (95% Payout)',
    color: 'emerald',
  },
  {
    id: 'bracket-7',
    minKPI: 95,
    maxKPI: 999, // 95% and above
    payoutPercent: 100,
    deductionPercent: 0,
    labelBn: '৯৫% বা তার বেশি (১০০% ইনসেন্টিভ)',
    labelEn: '95% or higher (100% Payout)',
    color: 'teal',
  }
];

export function calculateIncentive(kpiScore: number, baseIncentive: number, customBrackets?: KPIBracket[]): CalculationResult {
  const brackets = customBrackets || DEFAULT_BRACKETS;
  
  // Find matching bracket
  let matchedBracket = brackets.find(b => kpiScore >= b.minKPI && kpiScore <= b.maxKPI);
  
  // Safe fallback if not found
  if (!matchedBracket) {
    if (kpiScore < 0) {
      matchedBracket = brackets[0];
    } else {
      matchedBracket = brackets[brackets.length - 1];
    }
  }

  const payoutPercent = matchedBracket.payoutPercent;
  const deductionPercent = matchedBracket.deductionPercent;
  const payoutAmount = (baseIncentive * payoutPercent) / 100;
  const deductionAmount = (baseIncentive * deductionPercent) / 100;

  // Generate localized explanations
  let explanationBn = '';
  let explanationEn = '';

  if (matchedBracket.id === 'bracket-1') {
    explanationBn = 'KPI স্কোর ৭০% এর কম হওয়ায় কোনো ইনসেন্টিভ প্রাপ্য নয়।';
    explanationEn = 'Since KPI score is below 70%, no incentive is earned.';
  } else if (matchedBracket.deductionPercent > 0 && matchedBracket.payoutPercent !== 0) {
    if (matchedBracket.id === 'bracket-2' || matchedBracket.id === 'bracket-3') {
      explanationBn = `KPI স্কোর ${kpiScore}% হওয়ায় অর্জিত ইনসেন্টিভ থেকে ${deductionPercent}% কর্তন করা হয়েছে (${payoutPercent}% প্রাপ্য)।`;
      explanationEn = `Since KPI score is ${kpiScore}%, a deduction of ${deductionPercent}% is applied from the earned incentive (${payoutPercent}% payable).`;
    } else {
      explanationBn = `KPI স্কোর ${kpiScore}% হওয়ায় মোট ইনসেন্টিভের ${payoutPercent}% প্রদান করা হবে (${deductionPercent}% কর্তন)।`;
      explanationEn = `Since KPI score is ${kpiScore}%, ${payoutPercent}% of the incentive will be provided (${deductionPercent}% deduction).`;
    }
  } else {
    explanationBn = `অভিনন্দন! KPI স্কোর ${kpiScore}% হওয়ায় আপনি শতভাগ (১০০%) ইনসেন্টিভ পাচ্ছেন।`;
    explanationEn = `Congratulations! Since your KPI score is ${kpiScore}%, you receive full (100%) incentive payout.`;
  }

  return {
    kpiScore,
    baseIncentive,
    payoutPercent,
    deductionPercent,
    payoutAmount,
    deductionAmount,
    bracket: matchedBracket,
    explanationBn,
    explanationEn
  };
}

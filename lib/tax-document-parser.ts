interface TaxInfo {
  income: {
    wages: number;
    interest: number;
    dividends: number;
    otherIncome: number;
  };
  deductions: {
    standardDeduction: number;
    itemizedDeductions: number;
    otherDeductions: number;
  };
  taxCredits: {
    childTaxCredit: number;
    earnedIncomeCredit: number;
    otherCredits: number;
  };
}

export function extractTaxInfo(text: string): TaxInfo {
  const taxInfo: TaxInfo = {
    income: { wages: 0, interest: 0, dividends: 0, otherIncome: 0 },
    deductions: { standardDeduction: 0, itemizedDeductions: 0, otherDeductions: 0 },
    taxCredits: { childTaxCredit: 0, earnedIncomeCredit: 0, otherCredits: 0 },
  };

  // Extract wages
  const wagesMatch = text.match(/Wages, salaries, tips, etc\.\s*\$\s*([\d,]+)/);
  if (wagesMatch) {
    taxInfo.income.wages = parseFloat(wagesMatch[1].replace(/,/g, ''));
  }

  // Extract interest income
  const interestMatch = text.match(/Taxable interest\s*\$\s*([\d,]+)/);
  if (interestMatch) {
    taxInfo.income.interest = parseFloat(interestMatch[1].replace(/,/g, ''));
  }

  // Extract dividend income
  const dividendsMatch = text.match(/Ordinary dividends\s*\$\s*([\d,]+)/);
  if (dividendsMatch) {
    taxInfo.income.dividends = parseFloat(dividendsMatch[1].replace(/,/g, ''));
  }

  // Extract standard deduction
  const standardDeductionMatch = text.match(/Standard deduction\s*\$\s*([\d,]+)/);
  if (standardDeductionMatch) {
    taxInfo.deductions.standardDeduction = parseFloat(standardDeductionMatch[1].replace(/,/g, ''));
  }

  // Extract child tax credit
  const childTaxCreditMatch = text.match(/Child tax credit\s*\$\s*([\d,]+)/);
  if (childTaxCreditMatch) {
    taxInfo.taxCredits.childTaxCredit = parseFloat(childTaxCreditMatch[1].replace(/,/g, ''));
  }

  // Add more extraction logic for other fields as needed

  return taxInfo;
}
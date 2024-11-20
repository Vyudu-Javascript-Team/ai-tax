import { TaxKnowledgeBase } from '../ai/TaxKnowledgeBase';
import { prisma } from '../db';

interface TaxableIncome {
  wages: number;
  selfEmployment: number;
  investments: number;
  rental: number;
  other: number;
}

interface Deductions {
  standard: number;
  itemized: {
    mortgage: number;
    charity: number;
    stateTax: number;
    propertyTax: number;
    medical: number;
    other: number;
  };
}

interface Credits {
  childTax: number;
  earnedIncome: number;
  education: number;
  retirement: number;
  other: number;
}

interface TaxLiability {
  federalTax: number;
  stateTax: number;
  localTax: number;
  selfEmploymentTax: number;
  medicare: number;
  socialSecurity: number;
  total: number;
}

export class TaxCalculationEngine {
  private static instance: TaxCalculationEngine;
  private knowledgeBase: TaxKnowledgeBase;

  private constructor() {
    this.knowledgeBase = TaxKnowledgeBase.getInstance();
  }

  public static getInstance(): TaxCalculationEngine {
    if (!TaxCalculationEngine.instance) {
      TaxCalculationEngine.instance = new TaxCalculationEngine();
    }
    return TaxCalculationEngine.instance;
  }

  public async calculateTaxLiability(
    userId: string,
    year: number,
    state: string
  ): Promise<TaxLiability> {
    try {
      // Fetch user's financial data
      const income = await this.getTaxableIncome(userId, year);
      const deductions = await this.getDeductions(userId, year);
      const credits = await this.getCredits(userId, year);

      // Calculate adjusted gross income
      const agi = this.calculateAGI(income);

      // Calculate taxable income
      const taxableIncome = this.calculateTaxableIncome(agi, deductions);

      // Calculate federal tax
      const federalTax = await this.calculateFederalTax(taxableIncome, year);

      // Calculate state tax
      const stateTax = await this.calculateStateTax(taxableIncome, state, year);

      // Calculate other taxes
      const selfEmploymentTax = this.calculateSelfEmploymentTax(income.selfEmployment);
      const medicare = this.calculateMedicare(income);
      const socialSecurity = this.calculateSocialSecurity(income);

      // Apply tax credits
      const totalCredits = this.sumCredits(credits);

      // Calculate final liability
      const total = federalTax + stateTax + selfEmploymentTax + medicare + socialSecurity - totalCredits;

      return {
        federalTax,
        stateTax,
        localTax: 0, // Implement local tax calculation if needed
        selfEmploymentTax,
        medicare,
        socialSecurity,
        total: Math.max(0, total)
      };
    } catch (error) {
      console.error('Error calculating tax liability:', error);
      throw error;
    }
  }

  private async getTaxableIncome(userId: string, year: number): Promise<TaxableIncome> {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        year,
        type: { in: ['w2', '1099', '1099-B', '1099-MISC'] }
      }
    });

    const income: TaxableIncome = {
      wages: 0,
      selfEmployment: 0,
      investments: 0,
      rental: 0,
      other: 0
    };

    documents.forEach(doc => {
      const content = doc.content as any;
      switch (doc.type) {
        case 'w2':
          income.wages += Number(content.wages) || 0;
          break;
        case '1099':
          income.selfEmployment += Number(content.nonEmployeeCompensation) || 0;
          break;
        case '1099-B':
          income.investments += Number(content.proceedsFromBroker) || 0;
          break;
        case '1099-MISC':
          income.other += Number(content.otherIncome) || 0;
          break;
      }
    });

    return income;
  }

  private async getDeductions(userId: string, year: number): Promise<Deductions> {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        year,
        type: { in: ['1098', 'charity', 'medical'] }
      }
    });

    const deductions: Deductions = {
      standard: this.getStandardDeduction(year),
      itemized: {
        mortgage: 0,
        charity: 0,
        stateTax: 0,
        propertyTax: 0,
        medical: 0,
        other: 0
      }
    };

    documents.forEach(doc => {
      const content = doc.content as any;
      switch (doc.type) {
        case '1098':
          deductions.itemized.mortgage += Number(content.mortgageInterest) || 0;
          deductions.itemized.propertyTax += Number(content.propertyTax) || 0;
          break;
        case 'charity':
          deductions.itemized.charity += Number(content.amount) || 0;
          break;
        case 'medical':
          deductions.itemized.medical += Number(content.amount) || 0;
          break;
      }
    });

    return deductions;
  }

  private async getCredits(userId: string, year: number): Promise<Credits> {
    // Implement credit calculation logic
    return {
      childTax: 0,
      earnedIncome: 0,
      education: 0,
      retirement: 0,
      other: 0
    };
  }

  private calculateAGI(income: TaxableIncome): number {
    return (
      income.wages +
      income.selfEmployment +
      income.investments +
      income.rental +
      income.other
    );
  }

  private calculateTaxableIncome(agi: number, deductions: Deductions): number {
    const itemizedTotal =
      deductions.itemized.mortgage +
      deductions.itemized.charity +
      deductions.itemized.stateTax +
      deductions.itemized.propertyTax +
      deductions.itemized.medical +
      deductions.itemized.other;

    const deductionAmount = Math.max(deductions.standard, itemizedTotal);
    return Math.max(0, agi - deductionAmount);
  }

  private async calculateFederalTax(taxableIncome: number, year: number): Promise<number> {
    // Get tax brackets for the year
    const brackets = await this.getFederalTaxBrackets(year);
    let tax = 0;
    let remainingIncome = taxableIncome;

    brackets.forEach(bracket => {
      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.end - bracket.start
      );
      if (taxableInBracket > 0) {
        tax += taxableInBracket * (bracket.rate / 100);
        remainingIncome -= taxableInBracket;
      }
    });

    return tax;
  }

  private async calculateStateTax(
    taxableIncome: number,
    state: string,
    year: number
  ): Promise<number> {
    const stateTaxInfo = await prisma.stateTaxInfo.findUnique({
      where: { state }
    });

    if (!stateTaxInfo) {
      throw new Error(`Tax information not found for state: ${state}`);
    }

    const brackets = stateTaxInfo.incomeTaxRates as any[];
    let tax = 0;
    let remainingIncome = taxableIncome;

    brackets.forEach(bracket => {
      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.end - bracket.start
      );
      if (taxableInBracket > 0) {
        tax += taxableInBracket * (bracket.rate / 100);
        remainingIncome -= taxableInBracket;
      }
    });

    return tax;
  }

  private calculateSelfEmploymentTax(selfEmploymentIncome: number): number {
    const rate = 0.153; // 15.3% (12.4% Social Security + 2.9% Medicare)
    return selfEmploymentIncome * rate;
  }

  private calculateMedicare(income: TaxableIncome): number {
    const baseRate = 0.0145; // 1.45%
    const additionalRate = 0.009; // 0.9% additional Medicare tax
    const threshold = 200000; // Additional Medicare Tax threshold

    const totalIncome = this.calculateAGI(income);
    let medicareTax = totalIncome * baseRate;

    if (totalIncome > threshold) {
      medicareTax += (totalIncome - threshold) * additionalRate;
    }

    return medicareTax;
  }

  private calculateSocialSecurity(income: TaxableIncome): number {
    const rate = 0.062; // 6.2%
    const wageBase = 142800; // 2021 Social Security wage base
    const totalIncome = Math.min(this.calculateAGI(income), wageBase);
    return totalIncome * rate;
  }

  private sumCredits(credits: Credits): number {
    return (
      credits.childTax +
      credits.earnedIncome +
      credits.education +
      credits.retirement +
      credits.other
    );
  }

  private getStandardDeduction(year: number): number {
    // Standard deduction amounts by year
    const standardDeductions: Record<number, number> = {
      2021: 12550, // Single filer
      2022: 12950,
      2023: 13850
    };

    return standardDeductions[year] || standardDeductions[2023];
  }

  private async getFederalTaxBrackets(year: number): Promise<Array<{
    start: number;
    end: number;
    rate: number;
  }>> {
    // Federal tax brackets by year
    const brackets: Record<number, Array<{ start: number; end: number; rate: number }>> = {
      2023: [
        { start: 0, end: 11000, rate: 10 },
        { start: 11000, end: 44725, rate: 12 },
        { start: 44725, end: 95375, rate: 22 },
        { start: 95375, end: 182100, rate: 24 },
        { start: 182100, end: 231250, rate: 32 },
        { start: 231250, end: 578125, rate: 35 },
        { start: 578125, end: Infinity, rate: 37 }
      ]
    };

    return brackets[year] || brackets[2023];
  }

  public async generateTaxSummary(
    userId: string,
    year: number,
    state: string
  ): Promise<string> {
    try {
      const income = await this.getTaxableIncome(userId, year);
      const deductions = await this.getDeductions(userId, year);
      const liability = await this.calculateTaxLiability(userId, year, state);

      return `
Tax Summary for ${year}

Income:
- Wages: $${income.wages.toLocaleString()}
- Self-Employment: $${income.selfEmployment.toLocaleString()}
- Investments: $${income.investments.toLocaleString()}
- Rental: $${income.rental.toLocaleString()}
- Other: $${income.other.toLocaleString()}

Deductions:
- Standard Deduction: $${deductions.standard.toLocaleString()}
- Itemized Deductions:
  * Mortgage Interest: $${deductions.itemized.mortgage.toLocaleString()}
  * Charitable Contributions: $${deductions.itemized.charity.toLocaleString()}
  * State/Local Taxes: $${deductions.itemized.stateTax.toLocaleString()}
  * Property Taxes: $${deductions.itemized.propertyTax.toLocaleString()}
  * Medical Expenses: $${deductions.itemized.medical.toLocaleString()}

Tax Liability:
- Federal Tax: $${liability.federalTax.toLocaleString()}
- State Tax: $${liability.stateTax.toLocaleString()}
- Self-Employment Tax: $${liability.selfEmploymentTax.toLocaleString()}
- Medicare: $${liability.medicare.toLocaleString()}
- Social Security: $${liability.socialSecurity.toLocaleString()}

Total Tax Liability: $${liability.total.toLocaleString()}
      `;
    } catch (error) {
      console.error('Error generating tax summary:', error);
      throw error;
    }
  }
}

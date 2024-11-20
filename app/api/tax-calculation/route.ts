import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

function calculateTax(income: number): number {
  // This is a simplified tax calculation. In a real-world scenario,
  // you'd have a more complex calculation based on tax brackets, deductions, etc.
  if (income <= 50000) {
    return income * 0.15;
  } else if (income <= 100000) {
    return 7500 + (income - 50000) * 0.25;
  } else {
    return 20000 + (income - 100000) * 0.35;
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { taxReturnId } = await request.json();

    const taxReturn = await prisma.taxReturn.findUnique({
      where: { id: taxReturnId },
      include: { income: true, deductions: true, taxCredits: true },
    });

    if (!taxReturn) {
      return NextResponse.json({ error: "Tax return not found" }, { status: 404 });
    }

    const totalIncome = taxReturn.income.wages + taxReturn.income.interest + taxReturn.income.dividends + taxReturn.income.otherIncome;
    const totalDeductions = taxReturn.deductions.standardDeduction + taxReturn.deductions.itemizedDeductions + taxReturn.deductions.otherDeductions;
    const taxableIncome = Math.max(totalIncome - totalDeductions, 0);

    const calculatedTax = calculateTax(taxableIncome);
    const totalCredits = taxReturn.taxCredits.childTaxCredit + taxReturn.taxCredits.earnedIncomeCredit + taxReturn.taxCredits.otherCredits;
    const finalTax = Math.max(calculatedTax - totalCredits, 0);

    const updatedTaxReturn = await prisma.taxReturn.update({
      where: { id: taxReturnId },
      data: { calculatedTax: finalTax },
    });

    return NextResponse.json({
      taxableIncome,
      calculatedTax: finalTax,
      taxReturn: updatedTaxReturn,
    });
  } catch (error) {
    console.error("Error calculating tax:", error);
    return NextResponse.json({ error: "Failed to calculate tax" }, { status: 500 });
  }
}
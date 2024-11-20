import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import PDFDocument from "pdfkit";

const prisma = new PrismaClient();

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

    const doc = new PDFDocument();
    let buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      let pdfData = Buffer.concat(buffers);
      return new NextResponse(pdfData, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tax_return_${taxReturn.year}.pdf"`,
        },
      });
    });

    // Add content to the PDF
    doc.fontSize(25).text('Tax Return Summary', 100, 80);
    doc.fontSize(12).text(`Year: ${taxReturn.year}`, 100, 120);
    doc.text(`Status: ${taxReturn.status}`, 100, 140);
    doc.text(`Total Income: $${taxReturn.income.wages + taxReturn.income.interest + taxReturn.income.dividends + taxReturn.income.otherIncome}`, 100, 160);
    doc.text(`Total Deductions: $${taxReturn.deductions.standardDeduction + taxReturn.deductions.itemizedDeductions + taxReturn.deductions.otherDeductions}`, 100, 180);
    doc.text(`Total Credits: $${taxReturn.taxCredits.childTaxCredit + taxReturn.taxCredits.earnedIncomeCredit + taxReturn.taxCredits.otherCredits}`, 100, 200);
    doc.text(`Calculated Tax: $${taxReturn.calculatedTax || 'Not calculated'}`, 100, 220);

    doc.end();

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
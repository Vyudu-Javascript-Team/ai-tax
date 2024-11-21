import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prompt } = await request.json();
    
    // Fetch user's latest tax return for context
    const latestTaxReturn = await prisma.taxReturn.findFirst({
      where: { userId: session.user.id },
      orderBy: { year: 'desc' },
      include: { income: true, deductions: true, taxCredits: true },
    });

    // Prepare a context-aware prompt with null checks
    const contextAwarePrompt = `
      As an AI tax assistant, please provide advice based on the following tax return information:
      
      Year: ${latestTaxReturn?.year ?? 'N/A'}
      Status: ${latestTaxReturn?.status ?? 'N/A'}
      
      Income:
      - Wages: $${latestTaxReturn?.income?.wages ?? 0}
      - Interest: $${latestTaxReturn?.income?.interest ?? 0}
      - Dividends: $${latestTaxReturn?.income?.dividends ?? 0}
      - Other Income: $${latestTaxReturn?.income?.otherIncome ?? 0}
      
      Deductions:
      - Standard Deduction: $${latestTaxReturn?.deductions?.standardDeduction ?? 0}
      - Itemized Deductions: $${latestTaxReturn?.deductions?.itemizedDeductions ?? 0}
      - Other Deductions: $${latestTaxReturn?.deductions?.otherDeductions ?? 0}
      
      Tax Credits:
      - Child Tax Credit: $${latestTaxReturn?.taxCredits?.childTaxCredit ?? 0}
      - Earned Income Credit: $${latestTaxReturn?.taxCredits?.earnedIncomeCredit ?? 0}
      - Other Credits: $${latestTaxReturn?.taxCredits?.otherCredits ?? 0}

      User's question: ${prompt}

      Please provide a concise and helpful response, focusing on the specific question asked while considering the provided tax information.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: contextAwarePrompt }],
    });

    const aiResponse = completion.choices[0].message.content;
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return NextResponse.json({ error: "Failed to get AI assistance" }, { status: 500 });
  }
}
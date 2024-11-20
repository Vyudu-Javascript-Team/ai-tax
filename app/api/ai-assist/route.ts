import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
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

    // Prepare a context-aware prompt
    const contextAwarePrompt = `
      As an AI tax assistant, please provide advice based on the following tax return information:
      
      Year: ${latestTaxReturn?.year}
      Status: ${latestTaxReturn?.status}
      
      Income:
      - Wages: $${latestTaxReturn?.income.wages}
      - Interest: $${latestTaxReturn?.income.interest}
      - Dividends: $${latestTaxReturn?.income.dividends}
      - Other Income: $${latestTaxReturn?.income.otherIncome}
      
      Deductions:
      - Standard Deduction: $${latestTaxReturn?.deductions.standardDeduction}
      - Itemized Deductions: $${latestTaxReturn?.deductions.itemizedDeductions}
      - Other Deductions: $${latestTaxReturn?.deductions.otherDeductions}
      
      Tax Credits:
      - Child Tax Credit: $${latestTaxReturn?.taxCredits.childTaxCredit}
      - Earned Income Credit: $${latestTaxReturn?.taxCredits.earnedIncomeCredit}
      - Other Credits: $${latestTaxReturn?.taxCredits.otherCredits}

      User's question: ${prompt}

      Please provide a concise and helpful response, focusing on the specific question asked while considering the provided tax information.
    `;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: contextAwarePrompt }],
    });

    const aiResponse = completion.data.choices[0].message?.content;
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return NextResponse.json({ error: "Failed to get AI assistance" }, { status: 500 });
  }
}
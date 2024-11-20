import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;

    const totalReturns = await prisma.taxReturn.count({
      where: { userId },
    });

    const inProgressReturns = await prisma.taxReturn.count({
      where: { userId, status: "IN_PROGRESS" },
    });

    const submittedReturns = await prisma.taxReturn.count({
      where: { userId, status: "SUBMITTED" },
    });

    const estimatedRefund = await prisma.taxReturn.aggregate({
      where: { userId, status: "SUBMITTED" },
      _sum: {
        estimatedRefund: true,
      },
    });

    return NextResponse.json({
      totalReturns,
      inProgressReturns,
      submittedReturns,
      estimatedRefund: estimatedRefund._sum.estimatedRefund || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 });
  }
}
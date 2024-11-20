import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalUsers = await prisma.user.count();
    const totalTaxReturns = await prisma.taxReturn.count();
    const averageRefund = await prisma.taxReturn.aggregate({
      _avg: {
        calculatedTax: true,
      },
    });

    const monthlyStats = await prisma.taxReturn.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
    });

    const formattedMonthlyStats = monthlyStats.map(stat => ({
      month: stat.createdAt.toLocaleString('default', { month: 'short' }),
      returns: stat._count.id,
    }));

    return NextResponse.json({
      totalUsers,
      totalTaxReturns,
      averageRefund: averageRefund._avg.calculatedTax || 0,
      monthlyStats: formattedMonthlyStats,
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
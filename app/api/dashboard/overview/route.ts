import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyReturns = await prisma.taxReturn.groupBy({
      by: ['createdAt'],
      where: {
        userId,
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    const formattedData = monthlyReturns.map((item) => ({
      month: item.createdAt.toLocaleString('default', { month: 'short' }),
      returns: item._count.id,
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
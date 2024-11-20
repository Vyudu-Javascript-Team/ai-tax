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
    const upcomingDeadlines = await prisma.taxDeadline.findMany({
      where: {
        date: {
          gte: new Date(),
        },
      },
      orderBy: {
        date: 'asc',
      },
      take: 5,
    });

    const formattedDeadlines = upcomingDeadlines.map((deadline) => ({
      id: deadline.id,
      title: deadline.title,
      date: deadline.date.toISOString(),
    }));

    return NextResponse.json(formattedDeadlines);
  } catch (error) {
    console.error('Error fetching upcoming deadlines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
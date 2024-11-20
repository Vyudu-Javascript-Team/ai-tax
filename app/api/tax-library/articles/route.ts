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
    const articles = await prisma.taxLibraryArticle.findMany({
      select: {
        id: true,
        title: true,
        summary: true,
        source: true,
        url: true,
        category: true,
        date: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching tax library articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
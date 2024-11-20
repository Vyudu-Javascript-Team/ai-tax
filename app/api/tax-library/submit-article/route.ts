import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content } = await request.json();

    const article = await prisma.userSubmittedArticle.create({
      data: {
        title,
        content,
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ message: "Article submitted successfully", articleId: article.id });
  } catch (error) {
    console.error('Error submitting article:', error);
    return Next
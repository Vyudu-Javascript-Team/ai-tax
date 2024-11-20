import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // This is a placeholder for the actual API call to fetch new tax articles
    const response = await axios.get('https://api.example.com/tax-articles');
    const newArticles = response.data;

    for (const article of newArticles) {
      await prisma.taxLibraryArticle.create({
        data: {
          title: article.title,
          summary: article.summary,
          source: article.source,
          url: article.url,
          category: article.category,
          date: new Date(article.date),
        },
      });
    }

    return NextResponse.json({ message: "Tax library updated successfully" });
  } catch (error) {
    console.error('Error updating tax library:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
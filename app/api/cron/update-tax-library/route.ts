import { NextResponse } from 'next/server';
import { PrismaClient, TaxLibraryArticle } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Define the expected API response type
interface TaxArticleResponse {
  title: string;
  summary: string;
  source: string;
  url: string;
  category: 'FEDERAL' | 'STATE' | 'LOCAL' | 'INTERNATIONAL';
  date: string;
  content?: string;
  tags?: string[];
}

// Validate the article data
function isValidTaxArticle(article: any): article is TaxArticleResponse {
  return (
    typeof article.title === 'string' &&
    typeof article.summary === 'string' &&
    typeof article.source === 'string' &&
    typeof article.url === 'string' &&
    ['FEDERAL', 'STATE', 'LOCAL', 'INTERNATIONAL'].includes(article.category) &&
    typeof article.date === 'string' &&
    (article.content === undefined || typeof article.content === 'string') &&
    (article.tags === undefined || Array.isArray(article.tags))
  );
}

export async function GET() {
  try {
    // This is a placeholder for the actual API call to fetch new tax articles
    const response = await axios.get<TaxArticleResponse[]>('https://api.example.com/tax-articles');
    const newArticles = response.data;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const article of newArticles) {
      try {
        // Validate the article data
        if (!isValidTaxArticle(article)) {
          results.failed++;
          results.errors.push(`Invalid article data: ${article.title || 'unknown'}`);
          continue;
        }

        await prisma.taxLibraryArticle.create({
          data: {
            title: article.title,
            summary: article.summary,
            source: article.source,
            url: article.url,
            category: article.category,
            date: new Date(article.date),
            content: article.content || null,
            tags: article.tags || [],
            status: 'ACTIVE',
            lastUpdated: new Date(),
          },
        });

        results.success++;
      } catch (articleError) {
        results.failed++;
        results.errors.push(`Error processing article ${article.title}: ${articleError.message}`);
      }
    }

    return NextResponse.json({
      message: "Tax library update completed",
      results,
    });
  } catch (error) {
    console.error('Error updating tax library:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = new URL(request.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Validate pagination parameters
    const validPage = isNaN(page) ? 1 : Math.max(1, page);
    const validLimit = isNaN(limit) ? 10 : Math.max(1, Math.min(100, limit));

    // Build query
    const where = {
      userId: session.user.id,
      ...(status && { status }),
    };

    // Get total count for pagination
    const totalCount = await prisma.document.count({ where });
    const totalPages = Math.ceil(totalCount / validLimit);

    // Get documents
    const documents = await prisma.document.findMany({
      where,
      take: validLimit,
      skip: (validPage - 1) * validLimit,
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({
      documents,
      currentPage: validPage,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

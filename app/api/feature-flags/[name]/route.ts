import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { name: string } }) {
  try {
    const featureFlag = await prisma.featureFlag.findUnique({
      where: { name: params.name },
    });

    if (!featureFlag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({ enabled: featureFlag.enabled });
  } catch (error) {
    console.error('Error fetching feature flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
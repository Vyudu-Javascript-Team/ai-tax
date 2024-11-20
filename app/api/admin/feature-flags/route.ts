import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const featureFlags = await prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(featureFlags);
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, category, enabled } = await request.json();
    const featureFlag = await prisma.featureFlag.create({
      data: {
        name,
        description,
        category,
        enabled,
        changedBy: session.user.email,
      },
    });
    return NextResponse.json(featureFlag);
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, description, category, enabled } = await request.json();
    const oldFlag = await prisma.featureFlag.findUnique({ where: { id } });
    const updatedFlag = await prisma.featureFlag.update({
      where: { id },
      data: {
        name,
        description,
        category,
        enabled,
        changedBy: session.user.email,
      },
    });

    // Log the change
    if (oldFlag && oldFlag.enabled !== enabled) {
      await prisma.featureFlagChangeLog.create({
        data: {
          featureFlagId: id,
          changedBy: session.user.email,
          oldValue: oldFlag.enabled,
          newValue: enabled,
        },
      });
    }

    return NextResponse.json(updatedFlag);
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
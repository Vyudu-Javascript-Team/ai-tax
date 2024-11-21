import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

type ActivityWithUser = Prisma.ActivityGetPayload<{
  include: {
    user: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;

interface FormattedActivity {
  id: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  date: string;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.id;
    const recentActivities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const formattedActivities: FormattedActivity[] = recentActivities.map((activity: ActivityWithUser) => ({
      id: activity.id,
      user: {
        name: activity.user.firstName && activity.user.lastName
          ? `${activity.user.firstName} ${activity.user.lastName}`
          : 'Unknown User',
        email: activity.user.email,
      },
      action: activity.action,
      date: activity.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

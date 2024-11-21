import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendTrialReminderEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const trialEndingSoon = await prisma.user.findMany({
      where: {
        trialEndDate: {
          not: null,
          gte: new Date(),
          lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
        subscriptionStatus: 'TRIAL',
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        trialEndDate: true,
      },
    });

    for (const user of trialEndingSoon) {
      await sendTrialReminderEmail(user);
    }

    return NextResponse.json({ 
      message: 'Trial reminders sent successfully',
      count: trialEndingSoon.length
    });
  } catch (error) {
    console.error('Error sending trial reminders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const trialEndingSoon = await prisma.user.findMany({
      where: {
        trialEndDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        },
        subscriptionStatus: 'TRIAL',
      },
    });

    for (const user of trialEndingSoon) {
      await sendEmail({
        to: user.email,
        subject: 'Your trial is ending soon',
        text: `Your trial for AI Tax Prep will end on ${user.trialEndDate.toDateString()}. Add your payment method to continue using our services.`,
      });
    }

    return NextResponse.json({ message: 'Trial reminders sent successfully' });
  } catch (error) {
    console.error('Error sending trial reminders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import stripe from '@/lib/stripe';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const expiredTrials = await prisma.user.findMany({
      where: {
        trialEndDate: {
          lte: new Date(),
        },
        subscriptionStatus: 'TRIAL',
      },
    });

    for (const user of expiredTrials) {
      if (user.stripeCustomerId) {
        await stripe.subscriptions.create({
          customer: user.stripeCustomerId,
          items: [{ price: process.env.STRIPE_PRICE_ID }],
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: 'ACTIVE' },
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionStatus: 'EXPIRED' },
        });
      }
    }

    return NextResponse.json({ message: 'Trial end check completed successfully' });
  } catch (error) {
    console.error('Error in trial end check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
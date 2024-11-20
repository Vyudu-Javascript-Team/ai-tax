import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import stripe from '@/lib/stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { referralCode } = await request.json();

    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user || !user.subscription) {
      return NextResponse.json({ error: "User or subscription not found" }, { status: 404 });
    }

    // Apply 20% discount to the referred user
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      coupon: process.env.STRIPE_20_PERCENT_COUPON,
    });

    // Apply 10% discount to the referrer
    await stripe.subscriptions.update(referrer.subscription.stripeSubscriptionId, {
      coupon: process.env.STRIPE_10_PERCENT_COUPON,
    });

    // Update referral counts
    await prisma.user.update({
      where: { id: referrer.id },
      data: { referralCount: { increment: 1 } },
    });

    return NextResponse.json({ message: "Referral discount applied successfully" });
  } catch (error) {
    console.error('Error applying referral discount:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import stripe from '@/lib/stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define the session types
interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
}

interface Session {
  user: SessionUser;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as Session | null;
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the user from the database to access stripeCustomerId
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true }
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer ID found" }, { status: 400 });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
    });

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return NextResponse.json({ error: 'Failed to create setup intent' }, { status: 500 });
  }
}

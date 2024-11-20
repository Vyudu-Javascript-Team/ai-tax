import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import stripe from '@/lib/stripe';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          },
        });
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        await prisma.user.update({
          where: { stripeCustomerId: canceledSubscription.customer as string },
          data: {
            subscriptionStatus: 'CANCELED',
            subscriptionEndDate: new Date(),
          },
        });
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        await prisma.payment.create({
          data: {
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: 'SUCCEEDED',
            user: {
              connect: { stripeCustomerId: invoice.customer as string },
            },
          },
        });
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        await prisma.user.update({
          where: { stripeCustomerId: failedInvoice.customer as string },
          data: { subscriptionStatus: 'PAYMENT_FAILED' },
        });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}
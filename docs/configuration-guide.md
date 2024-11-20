# Configuration Guide for AI Tax Preparation Platform

This guide provides detailed instructions for configuring various services and integrations used in the AI Tax Preparation Platform.

## Environment Variables

Ensure all environment variables are set in your `.env.local` file:

```
DATABASE_URL=postgresql://username:password@localhost:5432/ai_tax_prep?schema=public
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
OPENAI_API_KEY=your_openai_api_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
SENDGRID_API_KEY=your_sendgrid_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

## Stripe Configuration

1. Create a Stripe account and obtain API keys from the Stripe Dashboard.
2. Set up products and price IDs for monthly and yearly subscriptions.
3. Configure webhooks to handle subscription events:
   - Go to Developers > Webhooks in the Stripe Dashboard.
   - Add an endpoint with the URL: `https://your-domain.com/api/webhooks/stripe`
   - Select events to listen for (e.g., `customer.subscription.updated`, `invoice.payment_succeeded`)
4. Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`

## SendGrid Configuration

1. Create a SendGrid account and obtain an API key.
2. Set up email templates for various notifications (e.g., welcome email, password reset).
3. Update `SENDGRID_API_KEY` in `.env.local`
4. Implement email sending logic in `lib/email.ts`

## OpenAI Configuration

1. Create an OpenAI account and obtain an API key.
2. Choose an appropriate AI model for tax assistance (e.g., GPT-3.5-turbo or GPT-4).
3. Update `OPENAI_API_KEY` in `.env.local`
4. Implement AI logic in `app/api/ai-assist/route.ts`

## Plaid Configuration

1. Create a Plaid account and obtain API credentials.
2. Set up the development environment in the Plaid Dashboard.
3. Update `PLAID_CLIENT_ID` and `PLAID_SECRET` in `.env.local`
4. Implement Plaid integration in `app/dashboard/financial-import/page.tsx`

## Redis Configuration

1. Set up an Upstash Redis instance.
2. Obtain the REST URL and token from the Upstash Dashboard.
3. Update `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`

## NextAuth Configuration

1. Generate a secret for NextAuth:
   ```
   openssl rand -base64 32
   ```
2. Update `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in `.env.local`

## Database Setup

1. Set up a PostgreSQL database (locally or using a cloud provider).
2. Update the `DATABASE_URL` in your `.env.local` file.
3. Run Prisma migrations to create the necessary tables:
   ```
   npx prisma migrate dev
   ```

## Additional Configuration

- Set up cron jobs for scheduled tasks (e.g., trial end checks, reminders) using a service like Vercel Cron or a dedicated cron job service.
- Configure proper error logging and monitoring (e.g., Sentry, LogRocket).
- Set up proper backups for the database.

For more detailed information on specific features and their implementation, refer to the `docs/comprehensive-feature-guide.md` file.
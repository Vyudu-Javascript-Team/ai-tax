# Third-Party Integrations Setup Guide

To ensure all features of the AI Tax Preparation Platform work fully, the following steps must be completed on third-party platforms:

## 1. Stripe Integration

1. Create a Stripe account if you haven't already (https://stripe.com).
2. In the Stripe Dashboard:
   - Create products and price IDs for monthly and yearly subscriptions.
   - Set up coupon codes for the referral discounts (20%, 10%, and 100%).
   - Create a webhook endpoint to handle subscription events.
3. Update the following environment variables in your `.env` file:
   ```
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
   STRIPE_YEARLY_PRICE_ID=your_yearly_price_id
   STRIPE_20_PERCENT_COUPON=your_20_percent_coupon_id
   STRIPE_10_PERCENT_COUPON=your_10_percent_coupon_id
   STRIPE_100_PERCENT_COUPON=your_100_percent_coupon_id
   ```

## 2. Email Service Integration

1. Choose an email service provider (e.g., SendGrid, Mailgun, AWS SES).
2. Set up an account and obtain API credentials.
3. Implement the `sendEmail` function in `lib/email.ts` using your chosen email service.
4. Add the necessary environment variables to your `.env` file, for example:
   ```
   EMAIL_SERVICE_API_KEY=your_email_service_api_key
   EMAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```

## 3. Database Setup

1. Set up a PostgreSQL database (locally or using a cloud provider).
2. Update the `DATABASE_URL` in your `.env` file:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/ai_tax_prep?schema=public
   ```
3. Run Prisma migrations to create the necessary tables:
   ```
   npx prisma migrate dev
   ```

## 4. NextAuth Configuration

1. Generate a secret for NextAuth:
   ```
   openssl rand -base64 32
   ```
2. Add the secret to your `.env` file:
   ```
   NEXTAUTH_SECRET=your_generated_secret
   NEXTAUTH_URL=http://localhost:3000 # Update for production
   ```

## 5. Vercel Deployment (if using Vercel)

1. Create a Vercel account and link your GitHub repository.
2. In the Vercel Dashboard:
   - Set up a new project for the AI Tax Preparation Platform.
   - Add all the environment variables from your `.env` file to the project settings.
3. Update the `NEXTAUTH_URL` environment variable to your production URL.

## 6. GitLab CI/CD Setup

1. In your GitLab project settings, add the following CI/CD variables:
   - `VERCEL_TOKEN`: Your Vercel deployment token
   - All other environment variables from your `.env` file

## 7. Cron Job Setup

1. Set up cron jobs to run the following API routes periodically:
   - `/api/cron/check-trial-end`
   - `/api/cron/send-trial-reminders`
2. This can be done using a service like Vercel Cron Jobs, Heroku Scheduler, or a dedicated cron job service.

## 8. AI Integration (if using OpenAI or another AI service)

1. Sign up for an OpenAI account and obtain an API key.
2. Add the API key to your `.env` file:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

## 9. Document OCR Integration

1. Choose an OCR service (e.g., Tesseract.js, Google Cloud Vision API).
2. If using a cloud service, obtain the necessary API credentials.
3. Add any required environment variables to your `.env` file.

## 10. Financial Data Import Integration

1. Sign up for a service like Plaid for financial data importing.
2. Obtain API credentials and add them to your `.env` file:
   ```
   PLAID_CLIENT_ID=your_plaid_client_id
   PLAID_SECRET=your_plaid_secret
   PLAID_ENV=sandbox # Change to 'development' or 'production' as needed
   ```

After completing these steps, your AI Tax Preparation Platform should be fully integrated with all necessary third-party services and ready for use. Remember to test all features thoroughly in a staging environment before deploying to production.
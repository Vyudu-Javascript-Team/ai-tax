# AI Tax Platform Developer Setup Guide

## Prerequisites

1. Node.js (v14 or later)
2. npm (v6 or later)
3. PostgreSQL database
4. API Keys for:
   - OpenAI
   - Plaid
   - Stripe
   - SendGrid
   - Sentry

## Initial Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-tax
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys and configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ai_tax_prep?schema=public"

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
CSRF_SECRET=your-csrf-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_ORG_ID=your-openai-org-id

# Plaid
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret
PLAID_ENV=sandbox

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
STRIPE_MONTHLY_PRICE_ID=your-stripe-price-id
STRIPE_YEARLY_PRICE_ID=your-stripe-yearly-price-id

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com

# Sentry
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed initial data:
```bash
npx prisma db seed
```

## Development Workflow

1. Start the development server:
```bash
npm run dev
```

2. Run tests:
```bash
npm test               # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

3. Run E2E tests:
```bash
npm run e2e       # Run Cypress tests
npm run e2e:open # Open Cypress test runner
```

## Key Components

### 1. Analytics Dashboard
- Location: `/app/dashboard/analytics/TaxAnalytics.tsx`
- Features:
  - Real-time tax metrics
  - Predictive analysis
  - Narrative insights

### 2. State Tax Comparison
- Location: `/app/dashboard/state-tax/StateTaxComparison.tsx`
- Features:
  - Multi-state comparison
  - Tax rate calculations
  - Special deductions lookup

### 3. API Integration Manager
- Location: `/lib/api/ApiIntegrationManager.ts`
- Manages:
  - OpenAI integration
  - Plaid connections
  - Stripe payments
  - SendGrid communications

### 4. Tax Knowledge Base
- Location: `/lib/ai/TaxKnowledgeBase.ts`
- Features:
  - AI model training
  - Tax rule validation
  - Guidance generation

## Database Schema

The application uses Prisma with PostgreSQL. Key models include:

1. User Management:
   - User
   - Profile
   - Authentication

2. Tax Information:
   - TaxRule
   - TaxException
   - Citation
   - TaxGuidance

3. Analytics:
   - AnalyticsEvent
   - StateTaxInfo

## API Endpoints

1. Authentication:
   - POST /api/auth/signup
   - POST /api/auth/signin
   - POST /api/auth/signout

2. Tax Operations:
   - GET /api/tax/rules
   - POST /api/tax/validate-deduction
   - GET /api/tax/state-comparison

3. Financial Operations:
   - POST /api/plaid/create-link
   - POST /api/plaid/exchange-token
   - GET /api/plaid/transactions

4. Analytics:
   - GET /api/analytics/metrics
   - POST /api/analytics/track

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Common Issues and Solutions

1. Database Connection:
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Ensure database exists

2. API Keys:
   - Verify all API keys are valid
   - Check environment variables
   - Ensure proper access levels

3. Build Issues:
   - Clear .next directory
   - Delete node_modules and reinstall
   - Check for TypeScript errors

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit PR with description

## Support

For technical issues:
1. Check documentation
2. Search existing issues
3. Create new issue with details

# AI Tax Preparation Platform - Complete Setup Guide

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- Redis instance (Upstash recommended)
- Stripe account
- SendGrid account
- OpenAI API access
- Plaid developer account

## Initial Setup

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd ai-tax-prep
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- Set `NEXTAUTH_URL` to `http://localhost:3000` for development
- Add all required API keys and credentials

## Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE ai_tax_prep;
```

2. Run database migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

3. Seed initial data:
```bash
npm run prisma:seed
```

## Third-Party Services Configuration

### 1. Stripe Setup
- Create products for subscription plans
- Set up webhooks (endpoint: `/api/webhooks/stripe`)
- Configure success/cancel URLs
- Add price IDs to environment variables

### 2. SendGrid Configuration
- Create API key
- Verify sender domain
- Set up email templates:
  - Welcome email
  - Password reset
  - Trial expiration
  - Payment reminders

### 3. OpenAI Setup
- Create API key
- Configure usage limits
- Set up monitoring

### 4. Plaid Integration
- Create development credentials
- Configure webhooks
- Set up sandbox testing

### 5. Redis Configuration
- Create Upstash Redis database
- Add connection URL and token to env vars
- Configure rate limiting parameters

## Security Setup

1. Configure CORS in `middleware.ts`
2. Set up CSP headers
3. Enable rate limiting
4. Configure authentication policies

## Development

Start development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Set up production database:
- Create production database
- Run migrations
- Configure connection pooling

3. Configure production environment:
- Set up SSL/TLS
- Configure domain and DNS
- Set up monitoring and logging

4. Deploy application:
```bash
npm start
```

## Monitoring Setup

1. Configure Sentry:
- Add DSN to environment variables
- Set up error alerts
- Configure performance monitoring

2. Set up logging:
- Configure application logs
- Set up error tracking
- Enable performance monitoring

## Cron Jobs

Set up the following cron jobs:

1. Trial end checks:
```bash
0 0 * * * curl https://your-domain.com/api/cron/check-trial-end
```

2. Trial reminders:
```bash
0 12 * * * curl https://your-domain.com/api/cron/send-trial-reminders
```

3. Tax library updates:
```bash
0 1 * * * curl https://your-domain.com/api/cron/update-tax-library
```

## Post-Deployment Checklist

- [ ] Verify all API endpoints
- [ ] Test authentication flow
- [ ] Confirm email sending
- [ ] Test payment processing
- [ ] Verify file uploads
- [ ] Check AI integration
- [ ] Test data import functionality
- [ ] Verify subscription management
- [ ] Check security headers
- [ ] Test rate limiting
- [ ] Verify database backups
- [ ] Test monitoring alerts

## Support and Maintenance

- Monitor error rates in Sentry
- Check application logs daily
- Review performance metrics
- Update dependencies weekly
- Perform security audits monthly
- Backup database daily

## Troubleshooting

Common issues and solutions:

1. Database connection errors:
   - Check connection string
   - Verify network access
   - Confirm SSL settings

2. Authentication issues:
   - Verify NextAuth configuration
   - Check JWT settings
   - Confirm callback URLs

3. Payment processing:
   - Verify Stripe webhooks
   - Check API keys
   - Confirm product IDs

4. Rate limiting:
   - Check Redis connection
   - Verify rate limit settings
   - Monitor usage patterns

## Contact Information

- Technical Lead: [Name] (email@domain.com)
- DevOps Lead: [Name] (email@domain.com)
- Security Lead: [Name] (email@domain.com)

## Additional Resources

- [API Documentation](./api-documentation.md)
- [Security Guidelines](./security-measures.md)
- [Deployment Guide](./deployment-guide.md)
- [Feature Documentation](./comprehensive-feature-guide.md)
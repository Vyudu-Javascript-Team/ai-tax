# AI Tax Preparation Platform

Welcome to the AI Tax Preparation Platform, an advanced solution for streamlining tax preparation and planning using artificial intelligence.

## Features

- User-friendly dashboard for managing tax returns
- AI-powered tax assistant for personalized guidance
- Document upload and management system
- Financial data import from various institutions
- Tax savings recommendations
- Expert consultation scheduling
- Comprehensive tax calendar
- Multi-year tax return comparison
- Free 7-day trial with automatic subscription

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- PostgreSQL database
- Stripe account
- SendGrid account (or another email service provider)
- OpenAI API key
- Plaid account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/ai-tax-prep-platform.git
   cd ai-tax-prep-platform
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in all required values in `.env.local`

4. Set up the database:
   - Create a PostgreSQL database
   - Update `DATABASE_URL` in `.env.local` with your database connection string
   - Run database migrations:
     ```
     npx prisma migrate dev
     ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open `http://localhost:3000` in your browser

## Deployment

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

For detailed deployment instructions, including Vercel deployment, refer to `docs/deployment-guide.md`.

## Configuration

- Stripe: Set up webhooks and product/price IDs in the Stripe dashboard
- SendGrid: Configure email templates and API integration
- OpenAI: Set up API access and configure the AI model
- Plaid: Set up API access for financial data importing

For detailed configuration instructions, refer to `docs/configuration-guide.md`.

## Documentation

- `docs/api-documentation.md`: API endpoints and usage
- `docs/user-guide.md`: End-user documentation
- `docs/developer-guide.md`: Development workflow and best practices
- `docs/security-measures.md`: Security features and best practices

## Contributing

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
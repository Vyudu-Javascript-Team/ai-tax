# AI Tax Preparation Platform Developer Guide

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local` and fill in the values)
4. Run the development server: `npm run dev`

## Project Structure

- `app/`: Next.js app router pages and API routes
- `components/`: Reusable React components
- `lib/`: Utility functions and shared logic
- `prisma/`: Database schema and migrations
- `public/`: Static assets

## Key Technologies

- Next.js 13 with App Router
- React 18
- TypeScript
- Prisma ORM
- NextAuth.js for authentication
- Stripe for payments
- Tailwind CSS for styling

## Testing

Run tests with: `npm test`

## Deployment

The project is set up for deployment on Vercel. Push to the `main` branch to trigger a production deployment.

## Contributing

1. Create a new branch for your feature or bug fix
2. Make your changes and commit them
3. Push your branch and create a pull request
4. Wait for review and approval

## Code Style

We use ESLint and Prettier for code formatting. Run `npm run lint` to check for linting errors.

## API Documentation

API endpoints are documented using Swagger. Visit `/api-docs` when running the development server to view the API documentation.

## Security

- Always validate user input
- Use CSRF protection for all POST, PUT, and DELETE requests
- Keep dependencies up to date
- Use environment variables for sensitive information

## Performance

- Use React Server Components where possible
- Optimize images and assets
- Implement proper caching strategies

For more detailed information on specific topics, please refer to the individual documentation files in the `docs/` directory.
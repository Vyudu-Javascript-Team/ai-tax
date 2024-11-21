import { describe, it, expect } from '@jest/globals';

describe('Test Environment Setup', () => {
  it('should have basic environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.DATABASE_URL).toBeDefined();
  });

  it('should have required API keys', () => {
    expect(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).toBeDefined();
    expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });

  it('should have authentication setup', () => {
    expect(process.env.NEXTAUTH_URL).toBeDefined();
    expect(process.env.NEXTAUTH_SECRET).toBeDefined();
  });

  it('should have mocked next/router', () => {
    const { useRouter } = require('next/router');
    const router = useRouter();
    expect(router.push).toBeDefined();
    expect(typeof router.push).toBe('function');
  });

  it('should have mocked next-auth', () => {
    const { useSession } = require('next-auth/react');
    const session = useSession();
    expect(session).toBeDefined();
    expect(session.status).toBe('unauthenticated');
  });
});

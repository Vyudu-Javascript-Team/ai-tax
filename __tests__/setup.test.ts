import { describe, it, expect } from '@jest/globals';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

describe('Test Environment Setup', () => {
  it('should have basic environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NEXTAUTH_URL).toBe('http://localhost:3000');
  });

  it('should have required API keys', () => {
    expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });

  it('should have authentication setup', () => {
    expect(process.env.NEXTAUTH_SECRET).toBeDefined();
    expect(process.env.DATABASE_URL).toBeDefined();
  });

  it('should have mocked next/navigation', () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    expect(router.push).toBeDefined();
    expect(router.replace).toBeDefined();
    expect(router.prefetch).toBeDefined();
    expect(searchParams.get).toBeDefined();
    expect(pathname).toBe('/');
  });

  it('should have mocked next-auth', () => {
    const session = useSession();
    expect(session).toBeDefined();
    expect(session.status).toBe('authenticated');
    expect(session.data?.user).toBeDefined();
    expect(session.data?.user.id).toBe('1');
    expect(session.data?.user.name).toBe('Test User');
    expect(session.data?.user.email).toBe('test@example.com');
  });
});

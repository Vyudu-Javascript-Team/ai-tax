describe('Test Environment Setup', () => {
  it('should have access to test environment variables', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY).toBeDefined();
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
    expect(session.status).toBe('unauthenticated');
  });
});

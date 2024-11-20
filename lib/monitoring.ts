import * as Sentry from "@sentry/nextjs";

export function initMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

export function captureException(error: Error) {
  Sentry.captureException(error);
}

export function setUserContext(userId: string) {
  Sentry.setUser({ id: userId });
}
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 0.1, // 10% of requests (free tier friendly)

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events if DSN is not configured
    if (!process.env.SENTRY_DSN) {
      return null;
    }

    // Remove sensitive data from event
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Remove sensitive environment variables
    if (event.contexts?.runtime?.env) {
      const env = event.contexts.runtime.env as Record<string, unknown>;
      delete env.JWT_SECRET;
      delete env.ADMIN_PASSWORD;
      delete env.DATABASE_URL;
      delete env.CRON_SECRET;
    }

    return event;
  },

  // Ignore common errors
  ignoreErrors: [
    'cancelled', // Cancelled requests
  ],
});


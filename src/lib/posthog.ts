import { PostHog } from "posthog-node"

// Initialize and export a singleton PostHog client for server-side usage
const posthogClient = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: 'history_change',
    flushAt: 1,
    flushInterval: 0,
  }
)

export default posthogClient

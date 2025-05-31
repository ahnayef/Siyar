
import { analytics } from './firebase';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';

export const logAnalyticsEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  if (analytics && typeof window !== 'undefined') { // Ensure analytics is initialized and we're on the client
    firebaseLogEvent(analytics, eventName, eventParams);
  } else {
    // Optional: console.log for debugging if analytics isn't available
    // console.log(`Analytics not available. Event: ${eventName}`, eventParams);
  }
};

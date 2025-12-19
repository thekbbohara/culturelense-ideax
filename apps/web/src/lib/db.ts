import { db, client } from '@/db';

// In serverless environments (like Next.js on Vercel), connection caching is handled differently.
// For standard SQL connections, relying on the 'db' export from packages/db is usually sufficient
// if it initializes the connection outside of the handler.

// We re-export here for convenient access within the app
export { db, client };

import dotenv from 'dotenv';

// Local development only (Vercel injects environment variables itself).
// .env.local takes precedence over .env; real environment variables override both.
// Import this module first so the values exist before other modules read them.
dotenv.config({ path: ['.env.local', '.env'], quiet: true });

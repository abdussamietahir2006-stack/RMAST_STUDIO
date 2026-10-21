// Vercel serverless entry: every /api/* request is rewritten here (see vercel.json)
// and handled by the same Express app used in local development.
import { createApp } from '../src/server/app.js';

export default createApp();

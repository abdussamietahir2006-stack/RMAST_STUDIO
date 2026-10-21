// Creates a dashboard account, or resets the password of an existing one.
//   npm run admin:create
// Prompts for email, name and password. For automation, set ADMIN_EMAIL, ADMIN_NAME and
// ADMIN_PASSWORD instead. The first account created becomes the owner.
import '../src/server/loadEnv.js';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { collections } from '../src/server/db.js';
import { hashPassword, validateNewPassword, destroyAllSessions } from '../src/server/auth.js';
import { EMAIL_RE } from '../src/server/security.js';

function ask(question: string, hidden = false): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Echo nothing while the password is typed
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (s.includes(question)) process.stdout.write(s);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    })
  );
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set in .env.local');

  const email = (process.env.ADMIN_EMAIL || (await ask('Email: '))).toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('Invalid email address');

  const users = await collections.users();
  const existing = await users.findOne({ email });
  const name = process.env.ADMIN_NAME || existing?.name || (await ask('Display name: ')) || email;

  const password = process.env.ADMIN_PASSWORD || (await ask('Password (min 12 characters): ', true));
  const problem = validateNewPassword(password);
  if (problem) throw new Error(problem);
  if (!process.env.ADMIN_PASSWORD && (await ask('Repeat password: ', true)) !== password) {
    throw new Error('Passwords do not match');
  }

  const passwordHash = await hashPassword(password);
  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: { passwordHash, name } });
    await destroyAllSessions(existing._id);
    console.log(`Password reset for ${email}. Existing sessions were signed out.`);
  } else {
    const role = (await users.countDocuments()) === 0 ? 'owner' : 'admin';
    await users.insertOne({ _id: crypto.randomUUID(), email, name, role, passwordHash, createdAt: new Date() });
    console.log(`Created ${role} account for ${email}.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(`Error: ${err instanceof Error ? err.message : err}`);
    process.exit(1);
  });

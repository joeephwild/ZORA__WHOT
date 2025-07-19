'use server';

import { InAppWallet, createThirdwebAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { client } from '@/lib/thirdweb-client';

const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY;

if (!privateKey) {
  throw new Error('Missing THIRDWEB_AUTH_PRIVATE_KEY in .env.local');
}

export const { GET, POST } = createThirdwebAuth({
  wallet: InAppWallet({
    client,
    auth: {
      options: ['email'],
    },
  }),
  authOptions: {
    // secure JWTs for auth
    tokenDurationInSeconds: 60 * 60 * 24 * 7, // 1 week
  },
  // Used for any on-chain actions
  adminAccount: privateKeyToAccount({ client, privateKey }),
});

import { createAuth } from 'thirdweb/auth';
import { privateKeyToAccount } from 'thirdweb/wallets';
import { client } from '@/lib/thirdweb-client';
import { NextRequest } from 'next/server';

const privateKey = process.env.THIRDWEB_AUTH_PRIVATE_KEY;

if (!privateKey) {
  throw new Error('Missing THIRDWEB_AUTH_PRIVATE_KEY in .env.local');
}

const auth = createAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || 'localhost:9002',
  adminAccount: privateKeyToAccount({ client, privateKey }),
  client,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'payload') {
    const address = searchParams.get('address');
    if (!address) {
      return Response.json({ error: 'Address is required' }, { status: 400 });
    }

    try {
      const payload = await auth.generatePayload({ address });
      return Response.json(payload);
    } catch (error) {
      return Response.json({ error: 'Failed to generate payload' }, { status: 500 });
    }
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload, signature, jwt } = body;

    if (action === 'verify') {
      if (!payload || !signature) {
        return Response.json({ error: 'Payload and signature are required' }, { status: 400 });
      }

      const verifiedPayload = await auth.verifyPayload({ payload, signature });
      const jwtToken = await auth.generateJWT({ payload: verifiedPayload });

      return Response.json({ jwt: jwtToken });
    }

    if (action === 'verify-jwt') {
      if (!jwt) {
        return Response.json({ error: 'JWT is required' }, { status: 400 });
      }

      const result = await auth.verifyJWT({ jwt });
      return Response.json(result);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

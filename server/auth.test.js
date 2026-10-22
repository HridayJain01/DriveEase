import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, signToken, verifyPassword, verifyToken } from './auth.js';

process.env.SESSION_SECRET = 'test-secret';

test('passwords hash and verify', async () => {
  const stored = await hashPassword('correct horse battery');
  assert.equal(await verifyPassword('correct horse battery', stored), true);
  assert.equal(await verifyPassword('wrong password', stored), false);
  assert.equal(await verifyPassword('anything', ''), false);
});

test('tokens round-trip and reject tampering or expiry', () => {
  const token = signToken({ sub: 'abc' });
  assert.equal(verifyToken(token).sub, 'abc');
  const [body, sig] = token.split('.');
  const forged = Buffer.from(JSON.stringify({ sub: 'evil', exp: Date.now() + 1e9 })).toString('base64url');
  assert.equal(verifyToken(`${forged}.${sig}`), null);
  assert.equal(verifyToken(`${body}.x${sig.slice(1)}`), null);
  assert.equal(verifyToken(signToken({ sub: 'abc' }, -1)), null);
  assert.equal(verifyToken('garbage'), null);
});

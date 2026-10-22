import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cloudinaryConfig, signParams } from './cloudinary.js';

test('signature matches Cloudinary’s documented example', () => {
  const params = { timestamp: 1315060510, public_id: 'sample_image', eager: 'w_400,h_300,c_pad|w_260,h_200,c_crop' };
  assert.equal(signParams(params, 'abcd'), 'bfd09f95f331f558cbd1320e67aa8d488770583e');
});

test('reads CLOUDINARY_URL', () => {
  assert.deepEqual(cloudinaryConfig('cloudinary://123:s%2Fecret@my-cloud'), { cloud: 'my-cloud', key: '123', secret: 's/ecret' });
  assert.equal(cloudinaryConfig(''), null);
});

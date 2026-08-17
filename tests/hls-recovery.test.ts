import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createHlsRecoveryController,
  HLS_RECOVERY_LIMIT,
} from '../src/lib/hls-recovery';

test('network and media HLS recovery budgets are independent', () => {
  const recovery = createHlsRecoveryController();

  for (let attempt = 0; attempt < HLS_RECOVERY_LIMIT; attempt += 1) {
    assert.equal(recovery.next('networkError'), 'restart-load');
  }
  assert.equal(recovery.next('networkError'), null);

  for (let attempt = 0; attempt < HLS_RECOVERY_LIMIT; attempt += 1) {
    assert.equal(recovery.next('mediaError'), 'recover-media');
  }
  assert.equal(recovery.next('mediaError'), null);
});

test('a buffered fragment resets HLS recovery budgets and unrelated errors are not recovered', () => {
  const recovery = createHlsRecoveryController();

  assert.equal(recovery.next('otherError'), null);
  assert.equal(recovery.next('networkError'), 'restart-load');
  assert.equal(recovery.next('networkError'), 'restart-load');
  assert.equal(recovery.next('networkError'), 'restart-load');
  assert.equal(recovery.next('networkError'), null);

  recovery.resetOnProgress();

  assert.equal(recovery.next('networkError'), 'restart-load');
  assert.equal(recovery.next('mediaError'), 'recover-media');
});

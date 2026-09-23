import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { criticalAttackIntermediate } from '../dist/verified-kernel.js';
const fixture = JSON.parse(readFileSync(new URL('./native-critical-vectors.json', import.meta.url)));
for (const vector of fixture.vectors) {
  test(`native critical block ${JSON.stringify(vector)}`, () => {
    assert.equal(criticalAttackIntermediate(vector.attackWithAddition, vector.isCritical, vector.criticalRate), vector.expected);
  });
}
test('reject unsupported input instead of silently changing it', () => {
  assert.throws(() => criticalAttackIntermediate(1.5, true), RangeError);
  assert.throws(() => criticalAttackIntermediate(1, true, NaN), TypeError);
});

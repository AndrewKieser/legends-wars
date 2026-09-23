// APK 4.2.3 BSDamageResult.CalcDamage, VA 0x138df9c–0x138dff0.
// Intermediate attack only. Does not implement final damage or critical chance.
export function criticalAttackIntermediate(attackWithAddition, isCritical, criticalRate = 0) {
  if (!Number.isInteger(attackWithAddition) || attackWithAddition < -2147483648 || attackWithAddition > 2147483647)
    throw new RangeError('Attack input must be a signed 32-bit integer.');
  if (typeof isCritical !== 'boolean' || !Number.isFinite(criticalRate))
    throw new TypeError('Expected a boolean and finite critical rate.');
  if (!isCritical) return attackWithAddition;
  const rate = Math.fround(criticalRate) || 0.5;
  const product = Math.fround(Math.fround(attackWithAddition) * rate);
  // ARM FCVTZS signed 32-bit saturation, then ADD W-register wrapping.
  const bonus = Math.max(-2147483648, Math.min(2147483647, Math.trunc(product)));
  return (attackWithAddition + bonus) | 0;
}

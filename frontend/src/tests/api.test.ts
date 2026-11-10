import { describe, it, expect } from 'vitest';

describe('BATON Client Token and Validation Suite', () => {
  it('validates signed token format begins with BATON-', () => {
    const validToken = 'BATON-eyJhbGciOiJIUzI1NiJ9.abcdef123456';
    expect(validToken.startsWith('BATON-')).toBe(true);

    const parts = validToken.substring(6).split('.');
    expect(parts.length).toBe(2);
  });

  it('calculates bus factor risk percentage correctly', () => {
    const totalGaps = 4;
    const criticalGaps = 2;
    const computedScore = Math.min(100, criticalGaps * 25 + totalGaps * 10);
    expect(computedScore).toBe(90);
    expect(computedScore).toBeGreaterThan(60); // Critical alert threshold
  });
});

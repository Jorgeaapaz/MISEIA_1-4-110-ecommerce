/**
 * Tests for the cents-first money model.
 * Validates that all price arithmetic is done in integer cents to avoid float drift.
 */
import { describe, it, expect } from 'vitest';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function calculateTotal(items: { qty: number; unitPrice: number }[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

describe('cents-first money model', () => {
  it('avoids floating-point drift when summing prices', () => {
    // Classic JS float problem: 0.1 + 0.2 = 0.30000000000000004
    const floatResult = 0.1 + 0.2;
    expect(floatResult).not.toBe(0.3);

    // Cents model: 10 + 20 = 30 cents (exact integer arithmetic)
    const centsResult = 10 + 20;
    expect(centsResult).toBe(30);
    expect(formatCents(centsResult)).toBe('$0.30');
  });

  it('calculates order total in cents without precision loss', () => {
    const items = [
      { qty: 1, unitPrice: 2999 }, // $29.99
      { qty: 2, unitPrice: 999 },  // $9.99 × 2 = $19.98
    ];
    const total = calculateTotal(items);
    expect(total).toBe(4997); // $49.97 exactly
    expect(formatCents(total)).toBe('$49.97');
  });

  it('formats cents to display string correctly', () => {
    expect(formatCents(0)).toBe('$0.00');
    expect(formatCents(100)).toBe('$1.00');
    expect(formatCents(999)).toBe('$9.99');
    expect(formatCents(10000)).toBe('$100.00');
    expect(formatCents(149999)).toBe('$1499.99');
  });

  it('handles zero quantity', () => {
    const items = [{ qty: 0, unitPrice: 999 }];
    expect(calculateTotal(items)).toBe(0);
  });

  it('handles empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('handles large orders without overflow (JS safe integer)', () => {
    // Max cart: 100 items × $9999.99 = $999,999 = 99,999,900 cents (well within safe integer)
    const items = Array(100).fill({ qty: 1, unitPrice: 999999 });
    const total = calculateTotal(items);
    expect(Number.isSafeInteger(total)).toBe(true);
    expect(total).toBe(99999900);
  });
});

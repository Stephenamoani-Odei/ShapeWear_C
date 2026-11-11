/** Ghana cedis formatting + pesewas helpers (Paystack works in pesewas). */
const GHS = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatGHS(amount: number): string {
  return GHS.format(amount);
}

/** GH₵ -> pesewas, rounded to a whole number to avoid float drift. */
export function toPesewas(amount: number): number {
  return Math.round(amount * 100);
}

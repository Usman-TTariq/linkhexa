/**
 * Format admin rollup maps (currency ISO → amount). Empty maps show "—", not a fake currency.
 */
export function formatCurrencyTotals(totals?: Record<string, number> | null): string {
  if (totals == null) return "—";
  const entries = Object.entries(totals).filter(([, v]) => Number.isFinite(v));
  if (entries.length === 0) return "—";
  entries.sort((a, b) => b[1] - a[1]);
  if (entries.length === 1) {
    return formatIsoCurrency(entries[0][1], entries[0][0]);
  }
  return entries
    .slice(0, 3)
    .map(([cur, amt]) => formatIsoCurrency(amt, cur))
    .join(" · ");
}

function formatIsoCurrency(amount: number, currency: string): string {
  const c = currency.toUpperCase();
  const locale = c === "GBP" ? "en-GB" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: c,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${c} ${amount.toFixed(2)}`;
  }
}

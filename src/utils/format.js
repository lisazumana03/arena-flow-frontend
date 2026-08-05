// Shared formatting helpers. Currency defaults to ZAR since the sample data
// (venues, teams) in this project is South Africa-flavoured — swap the
// locale/currency here if that's not the right assumption for your data.
export function formatCurrency(value) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(num);
}

export function formatPercent(value) {
  return `${Math.round(Number(value ?? 0))}%`;
}

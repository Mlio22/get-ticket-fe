/**
 * Format a number as a currency string.
 * @param amount  Numeric amount (e.g. 150000)
 * @param currency ISO 4217 currency code (default: "IDR")
 * @param locale  BCP-47 locale string (default: "id-ID")
 */
export function formatCurrency(
  amount: number,
  currency = "IDR",
  locale = "id-ID"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a currency amount for display in compact form (e.g. 1.5M, 150K).
 */
export function formatCurrencyCompact(
  amount: number,
  currency = "IDR",
  locale = "id-ID"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Returns "Free" for zero-price tickets, otherwise a formatted currency.
 */
export function formatTicketPrice(
  price: number,
  currency = "IDR",
  locale = "id-ID"
): string {
  if (price === 0) return "Free";
  return formatCurrency(price, currency, locale);
}

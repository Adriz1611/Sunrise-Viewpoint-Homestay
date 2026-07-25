/**
 * Only the display form of a phone number is stored in Payload; the tel: link
 * is derived so the two can never drift apart.
 * "+91 98006 37784" -> "tel:+919800637784"
 */
export function telHref(number: string): string {
  const digits = number.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
}

/**
 * Deliberately permissive: Indian numbers are written many ways, and an
 * over-strict regex would block a legitimate edit by the client.
 */
export function validatePhone(value: string | null | undefined): string | true {
  if (!value) return "A phone number is required.";
  if (value.replace(/\D/g, "").length < 10) {
    return "Enter the full number including the country or area code (at least 10 digits).";
  }
  return true;
}

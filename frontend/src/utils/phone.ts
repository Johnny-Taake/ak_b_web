/**
 * Formats phone number: links by removing all non-digit characters except +
 * @param phone - The phone number string
 * @returns Formatted phone number: links
 */
export function formatPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Validates if a phone number has a valid format
 * @param phone - The phone number string
 * @returns True if phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return false;

  const phoneRegex = /^\+?[0-9\s\-()]+$/;
  return phoneRegex.test(phone);
}

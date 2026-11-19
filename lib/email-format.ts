const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidMailRecipient(email: string): boolean {
  return EMAIL_RE.test(email.trim().toLowerCase());
}

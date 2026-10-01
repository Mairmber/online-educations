// Shared payment / access helpers for the Eduqasion paywall.
// Set PAYSTACK_PAGE_URL to your live Paystack Payment Page to enable card + MoMo checkout.
export const PAYSTACK_PAGE_URL = "";
export const MOMO_NUMBER = "0591682257";
export const COURSE_REGISTRATION_FEE = 30;

// A student has access if they have at least one CONFIRMED payment matching their email.
export function isPaid(payments, email) {
  if (!email || !Array.isArray(payments)) return false;
  const e = email.toLowerCase();
  return payments.some(p => (p.student_email || "").toLowerCase() === e && p.status === "confirmed");
}
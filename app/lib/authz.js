export function isAdminUser(user) {
  if (!user) return false;
  const emails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (emails.length > 0) {
    return emails.includes((user.email || "").toLowerCase());
  }
  // Fallback: allow no admins if env not set
  return false;
}



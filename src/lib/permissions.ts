import { getSession } from "./auth";

export async function hasPermission(permission: string) {
  const session = await getSession();
  if (!session) return false;

  // SUPER_ADMIN and MERCHANT (owner) have all permissions by default
  if (session.role === "SUPER_ADMIN" || session.role === "MERCHANT") {
    return true;
  }

  // Check custom permissions for STAFF (Handle both : and . notation for compatibility)
  if (session.permissions && Array.isArray(session.permissions)) {
    const requested = permission.replace(":", ".");
    return session.permissions.some(p => p.toString().replace(":", ".") === requested);
  }

  return false;
}

export async function requirePermission(permission: string) {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error(`Forbidden: Missing permission [${permission}]`);
  }
  return true;
}

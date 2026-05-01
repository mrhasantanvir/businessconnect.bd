import { cookies } from "next/headers";
import { encrypt, decrypt } from "./auth-edge";

export { encrypt, decrypt };

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    if (!payload || !payload.userId) return null;

    // Optional: Only check single session for non-SUPER_ADMIN or for everyone?
    // Let's check for everyone to be strict.
    const { db: prisma } = await import("./db");
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { currentSessionId: true, isActive: true }
    });

    if (!user || (payload.sessionId && user.currentSessionId !== payload.sessionId)) {
      return null;
    }

    return { ...payload, isActive: user.isActive };
  } catch (error) {
    console.error("Session decryption failed:", error);
    return null;
  }
}

export async function updateSession(request: any) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
  
  return {
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  };
}

import { cookies } from "next/headers";
import { encrypt, decrypt } from "./auth-edge";

export { encrypt, decrypt };

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  try {
    return await decrypt(session);
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

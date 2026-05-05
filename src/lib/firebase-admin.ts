import * as admin from "firebase-admin";
import { db as prisma } from "./db";

let isInitialized = false;

async function initializeAdmin() {
  if (isInitialized) return;

  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "GLOBAL" } });
    
    if (!settings?.firebaseProjectId || !settings?.firebaseClientEmail || !settings?.firebasePrivateKey) {
      console.warn("Firebase Admin credentials not found in Database. Push notifications may not work.");
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: settings.firebaseProjectId,
          clientEmail: settings.firebaseClientEmail,
          privateKey: settings.firebasePrivateKey.replace(/\\n/g, "\n"),
        }),
        databaseURL: settings.firebaseDatabaseUrl || undefined,
      });
    }
    isInitialized = true;
  } catch (error: any) {
    console.error("Firebase Admin initialization error:", error.message);
  }
}

export const getAdminMessaging = async () => {
  await initializeAdmin();
  if (!isInitialized) throw new Error("Firebase Admin not initialized");
  return admin.messaging();
};

export const getAdminAuth = async () => {
  await initializeAdmin();
  if (!isInitialized) throw new Error("Firebase Admin not initialized");
  return admin.auth();
};

export const getAdminDb = async () => {
  await initializeAdmin();
  if (!isInitialized) throw new Error("Firebase Admin not initialized");
  return admin.database();
};

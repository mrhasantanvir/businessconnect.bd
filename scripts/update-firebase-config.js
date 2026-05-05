const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const firebaseConfig = {
    apiKey: "AIzaSyAtpRsEkdRbMAchpLEG4UToDlpIFwv64mY",
    authDomain: "businessconnect-a9bcc.firebaseapp.com",
    projectId: "businessconnect-a9bcc",
    storageBucket: "businessconnect-a9bcc.firebasestorage.app",
    messagingSenderId: "409761820299",
    appId: "1:409761820299:web:8c5f09bffcee754c8fee8e",
    databaseURL: "https://businessconnect-a9bcc-default-rtdb.firebaseio.com", // Assumed default if not provided, or empty
    clientEmail: "firebase-adminsdk-fbsvc@businessconnect-a9bcc.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\n" +
      "MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDRe2GNWKE+TRo1\n" +
      "IQ554Ji2bKEH5GEpZAKcJX2yghs+rA3/fScAj3p7LPmHF8n66JZmaDJqAuBYFqDU\n" +
      "xOh+FeNAKKEu1K6QSjS+97Q9wkRIQclHgeNiLB9xiWVFIEK6zjYURL17y96CpOhu\n" +
      "j40Wt9X9u8+NOi0l9fviV+LnjnFzQxj3lVy14gGJfvVkU0KRf/a9rPeSeAFMpibD\n" +
      "kS2GbQke6xERBdfOPh3kHbqkrk+2FymXzLbGIG7W4vKoHBKKjHpS7vTYzBW5dBlU\n" +
      "OF8q5xfjDCxNmzlgXjOrPn02McwEbgMUzmVAtuff9ebCFo3izyrTxI24FVDXta9S\n" +
      "mLMqogetAgMBAAECggEAG9EM6qaGvs2hOcXadL+ot6ykE3a1mjfwCskFsHMLaB6T\n" +
      "u0XkrHPg+UNHHTPA++LvuciDTUV1gez7TVWaY8fHRek/Qgc26O0ZpPQiiILn60pl\n" +
      "DmxGg+5E/KAYhP3cLo8cakOYf7xaHzIDtU61lvsxXMCYNnIvtZc869jsxf/Ju9rC\n" +
      "20FPBEiOhzgNlOLMYDmtf4BUsKvP6ZRUzBhNXtnTabuabNd7ztP+8rRlE0juhocr\n" +
      "/xQjDP7Ybw4C15XSK0utczYSdz1x6Adpu9uX/5ueSIkjfyIISU4wa93pOpt1lXQG\n" +
      "gnIewNc4rrn7eI2B8X9p0N4SV0csmx+RxpzA3oIcsQKBgQD7hdNLoX9M3S9YxXqb\n" +
      "webe0KuDPJIX6rscqAAZq10MkFGhdC5yCM2NPPn72bJCBwXAimS7k7HXbic3FdMD\n" +
      "2/wke/GLCECYFti4owsfNWxO3w8oH0Qw8s14qaqhzVIGckEb+12ZS2t447f6dEBi\n" +
      "8/jAXTTsyJu5cc+SUd0bH2DNGQKBgQDVNfpr3zopAjDoD897BfVw6A3RjrOx1P1X\n" +
      "I0kjxAX2XPF51i1v+D+T8RGaAHqYdX5TUhcvIOcR9mvPaQYCR33iPCOXV7uJ8mfJ\n" +
      "nS2qeKka79rVQNAZq8hdoq8M1FQJQv8s5EQQA+LbI0my3dyvA68At0+RPvk4QVfi\n" +
      "yBb+GRTNtQKBgFqniFmZEq3chsUjICblg1XJtheuDCXsp5YTgz29QuNVXOapXlgh\n" +
      "jhya3qsEcrhTmaIk/1uQRygTfrTe+9hHQKDRv2RSDB4FFgWuVkLgWXIv+WGHq2dN\n" +
      "C/uyg1qgCzFhmtAAEGNBCLJguR3fKpm/v2dt8LZrM51qRNtDAENXUud5AoGBAJ67\n" +
      "M/eRVkRnjC+IbchCNGtdZ8RGwEM5tW5lJ7OH4YR7x48UQ/mjUPn8NEV568uLVYQE\n" +
      "jpwYm88ErVjZ8I5L2U1PxpOKzmUx4dD4wqGyePtD7KBtQ0CJYn9LeZVMkk/e4Aj0\n" +
      "3DMsIX1R9TFD+WMWk/gtgQA6aOJXy21b17pOw+0tAoGAXB/EKLQddeL/kgoIhQ4v\n" +
      "9dU4/5awibrKE3Bx4ZN6kWXEf5G9tm92oe13COJvfn0mhI3fGV1h94IPpGCvB7c4\n" +
      "g9yIs8gcqnRVBMV2wfxgTi+GLL9OWAKRnyydC3X76vguCK6R14mfyCzVRGO/y5Ql\n" +
      "YM/u0jAuF/EUs13DEtUOXYk=\n" +
      "-----END PRIVATE KEY-----\n"
  };

  await prisma.systemSettings.upsert({
    where: { id: "GLOBAL" },
    update: {
      firebaseApiKey: firebaseConfig.apiKey,
      firebaseAuthDomain: firebaseConfig.authDomain,
      firebaseProjectId: firebaseConfig.projectId,
      firebaseStorageBucket: firebaseConfig.storageBucket,
      firebaseMessagingSenderId: firebaseConfig.messagingSenderId,
      firebaseAppId: firebaseConfig.appId,
      firebaseDatabaseUrl: firebaseConfig.databaseURL,
      firebaseClientEmail: firebaseConfig.clientEmail,
      firebasePrivateKey: firebaseConfig.privateKey,
      realtimeProvider: "FIREBASE"
    },
    create: {
      id: "GLOBAL",
      firebaseApiKey: firebaseConfig.apiKey,
      firebaseAuthDomain: firebaseConfig.authDomain,
      firebaseProjectId: firebaseConfig.projectId,
      firebaseStorageBucket: firebaseConfig.storageBucket,
      firebaseMessagingSenderId: firebaseConfig.messagingSenderId,
      firebaseAppId: firebaseConfig.appId,
      firebaseDatabaseUrl: firebaseConfig.databaseURL,
      firebaseClientEmail: firebaseConfig.clientEmail,
      firebasePrivateKey: firebaseConfig.privateKey,
      realtimeProvider: "FIREBASE"
    }
  });

  console.log("Firebase configuration updated successfully in Database.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

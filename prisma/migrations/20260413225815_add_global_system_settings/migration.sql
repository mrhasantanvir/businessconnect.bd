-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'GLOBAL',
    "isLiveChatEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsActiveProvider" TEXT NOT NULL DEFAULT 'FIREBASE',
    "smsApiKey" TEXT,
    "smsSenderId" TEXT,
    "smsApiUrl" TEXT,
    "pusherAppId" TEXT,
    "pusherKey" TEXT,
    "pusherSecret" TEXT,
    "pusherCluster" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpFrom" TEXT,
    "whatsappToken" TEXT,
    "whatsappPhoneId" TEXT,
    "updatedAt" DATETIME NOT NULL
);

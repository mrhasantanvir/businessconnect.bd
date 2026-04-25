import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function test() {
    console.log("Models:", Object.keys(prisma).filter(k => !k.startsWith("_")));
    await prisma.$disconnect();
}
test();

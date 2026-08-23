import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "admin@goldenage.com" },
    update: {},
    create: {
      name: "Abdulgeni Abdulaziz",
      email: "admin@goldenage.com",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash,
      department: "Operations",
    },
  });

  console.log("Seeded admin@goldenage.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
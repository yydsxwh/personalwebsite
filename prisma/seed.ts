import { hashPassword, makeReferralCode } from "../packages/shared/src/password";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("123456");

  await prisma.user.upsert({
    where: { email: "admin@yyds.local" },
    update: { passwordHash, role: "ADMIN", roles: "ADMIN", passwordSet: true },
    create: {
      email: "admin@yyds.local",
      name: "站长",
      passwordHash,
      role: "ADMIN",
      roles: "ADMIN",
      bio: "",
      referralCode: makeReferralCode(),
    },
  });

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  await prisma.personProfile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
    },
  });

  console.log("个人 IP 站已就绪");
  console.log("站长: admin@yyds.local / 123456");
  console.log("前台: /about/person");
  console.log("后台: /person-admin");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

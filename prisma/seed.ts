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
      name: "Andyyyds",
      passwordHash,
      role: "ADMIN",
      roles: "ADMIN",
      bio: "个人 IP 站站长",
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
      displayName: "Andyyyds",
      headline: "把个人 IP 做成可独立交付的软件产品",
      about:
        "这是从 Andyyyds 主站迁出的个人展示站。档案、项目、博客、作品、荣誉和自媒体同步都在这里维护。",
      email: "yydsxwh@gmail.com",
      github: "yydsxwh",
      website: "https://github.com/yydsxwh/personalwebsite",
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

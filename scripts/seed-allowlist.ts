import { PrismaClient, Role } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log('Uso: npm run seed:admin -- email@dominio.com');
    process.exit(1);
  }
  await prisma.allowlist.upsert({
    where: { email },
    update: { role: Role.ADMIN },
    create: { email, role: Role.ADMIN },
  });
  console.log('Allowlist OK para', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

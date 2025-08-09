import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const remove = form.get("remove") as string | null;
  if (remove) {
    await prisma.allowlist.delete({ where: { email: remove } });
    return NextResponse.redirect("/admin");
  }
  const email = (form.get("email") as string).trim().toLowerCase();
  const role = (form.get("role") as string) as Role;
  await prisma.allowlist.upsert({
    where: { email },
    update: { role },
    create: { email, role },
  });
  return NextResponse.redirect("/admin");
}

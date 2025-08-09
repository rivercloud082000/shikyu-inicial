import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const text = (form.get("emails") as string) || "";
  const role = (form.get("role") as string as Role) || "TEACHER";

  const emails = text
    .split(/\r?\n/)
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  for (const email of emails) {
    await prisma.allowlist.upsert({
      where: { email },
      update: { role },
      create: { email, role },
    });
  }
  return NextResponse.redirect("/admin");
}

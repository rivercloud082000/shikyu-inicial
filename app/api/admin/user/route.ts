import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = (form.get("email") as string).trim().toLowerCase();
  const toggle = form.get("toggle");
  if (toggle) {
    const u = await prisma.user.findUnique({ where: { email } });
    if (u) {
      await prisma.user.update({
        where: { email },
        data: { isAllowed: !u.isAllowed },
      });
    }
  }
  return NextResponse.redirect("/admin");
}

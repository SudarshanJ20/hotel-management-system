// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await auth();
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!session?.user?.email && !sessionUser?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name =
    typeof body?.name === "string" ? body.name.trim() : undefined;
  const image =
    typeof body?.image === "string" ? body.image.trim() : undefined;
  const phone =
    typeof body?.phone === "string" ? body.phone.trim() : undefined;

  const currentPassword =
    typeof body?.currentPassword === "string" ? body.currentPassword : undefined;
  const newPassword =
    typeof body?.newPassword === "string" ? body.newPassword : undefined;

  if (!name && !image && !phone && !newPassword) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const email = session?.user?.email;
  const where = sessionUser?.id
    ? { id: String(sessionUser.id) }
    : { email: String(email!) };

  // If password change requested, validate current password for credentials users
  if (newPassword) {
    const dbUser = await prisma.user.findUnique({
      where,
      select: { password: true },
    });

    // If user logged in via Google (no password), block password change
    if (!dbUser?.password) {
      return NextResponse.json(
        { error: "Password change not available for Google sign-in accounts." },
        { status: 400 }
      );
    }

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(currentPassword, dbUser.password);
    if (!ok) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 }
      );
    }
  }

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (image !== undefined) data.image = image; // empty string allowed to clear avatar
  if (phone !== undefined) data.phone = phone;
  if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where,
    data,
    select: { id: true, name: true, email: true, image: true, phone: true },
  });

  return NextResponse.json(updated);
}

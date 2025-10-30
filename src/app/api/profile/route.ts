// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.email && !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const image = typeof body?.image === "string" ? body.image.trim() : undefined;

  if (!name && !image) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  const where =
    session.user.id
      ? { id: String((session.user as any).id) }
      : { email: String(session.user.email) };

  const updated = await prisma.user.update({
    where,
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(updated);
}

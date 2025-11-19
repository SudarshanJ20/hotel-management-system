// src/app/api/rooms/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/rooms/:id (public)
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

// PATCH /api/rooms/:id (admin only)
export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const updated = await prisma.room
    .update({
      where: { id },
      data: {
        title: body.title?.toString(),
        description: body.description?.toString(),
        price: body.price !== undefined ? Number(body.price) : undefined,
        capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
        status: body.status?.toString(),
        image: body.image ?? undefined,
      },
    })
    .catch(() => null);

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE /api/rooms/:id (admin only)
export async function DELETE(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await prisma.room
    .delete({ where: { id } })
    .catch(() => null);

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

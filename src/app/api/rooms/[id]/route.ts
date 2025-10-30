import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

// GET /api/rooms/:id
export async function GET(_req: Request, { params }: Params) {
  const room = await prisma.room.findUnique({ where: { id: params.id } });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

// PATCH /api/rooms/:id
export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  const room = await prisma.room.update({
    where: { id: params.id },
    data: {
      title: body.title,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
      status: body.status,
      image: body.image,
    },
  }).catch(() => null);
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(room);
}

// DELETE /api/rooms/:id
export async function DELETE(_req: Request, { params }: Params) {
  await prisma.room.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/rooms - list all rooms
export async function GET() {
  const rooms = await prisma.room.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rooms);
}

// POST /api/rooms - create a new room
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.title || body.price === undefined || body.capacity === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const room = await prisma.room.create({
    data: {
      title: body.title,
      description: body.description ?? "",
      price: Number(body.price),
      capacity: Number(body.capacity),
      status: body.status ?? "AVAILABLE",
      image: body.image ?? null,
    },
  });
  return NextResponse.json(room, { status: 201 });
}

// src/app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

// GET /api/rooms?q=&limit=&page=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 50);
  const offset = (page - 1) * limit;

  const where: Prisma.RoomWhereInput = q
    ? {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.room.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.room.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

// POST /api/rooms - create a new room (admin only)
export async function POST(req: Request) {
 const session = await getServerSession(authOptions);
const role = (session?.user as any)?.role;
if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

  const body = await req.json().catch(() => null);
  const title = body?.title?.toString().trim();
  const price = body?.price;
  const capacity = body?.capacity;

  if (!title || price === undefined || capacity === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const room = await prisma.room.create({
    data: {
      title,
      description: body?.description?.toString() ?? "",
      price: Number(price),
      capacity: Number(capacity),
      status: body?.status?.toString() ?? "AVAILABLE",
      image: body?.image ?? null,
    },
  });

  return NextResponse.json(room, { status: 201 });
}

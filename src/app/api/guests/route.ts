// src/app/api/guests/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

// GET /api/guests?q=&page=&limit=
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "12", 10), 1), 50);
  const offset = (page - 1) * limit;

  const where: Prisma.GuestWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { phone: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.guest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.guest.count({ where }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
}

// POST /api/guests - admin only
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
const role = (session?.user as any)?.role;
if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

  const body = await req.json().catch(() => null);
  const name = body?.name?.toString().trim();
  const email = body?.email?.toString().trim();
  const phone = body?.phone?.toString().trim();

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const guest = await prisma.guest.create({
    data: {
      name,
      email: email || null,
      phone: phone || null,
      address: body?.address?.toString() ?? null,
      notes: body?.notes?.toString() ?? null,
    },
  });

  return NextResponse.json(guest, { status: 201 });
}

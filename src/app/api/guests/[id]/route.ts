// src/app/api/guests/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Params = { params: { id: string } };

// GET /api/guests/:id
export async function GET(_req: Request, { params }: Params) {
  const guest = await prisma.guest.findUnique({ where: { id: params.id } });
  if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(guest);
}

// PATCH /api/guests/:id (admin only)
export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const updated = await prisma.guest
    .update({
      where: { id: params.id },
      data: {
        name: body.name?.toString(),
        email: body.email?.toString() ?? null,
        phone: body.phone?.toString() ?? null,
        address: body.address?.toString() ?? null,
        notes: body.notes?.toString() ?? null,
      },
    })
    .catch(() => null);

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

// DELETE /api/guests/:id (admin only)
export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
const role = (session?.user as any)?.role;
if (!role || (role !== "ADMIN" && role !== "MANAGER")) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}


  const deleted = await prisma.guest.delete({ where: { id: params.id } }).catch(() => null);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

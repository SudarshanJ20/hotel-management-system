import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  await prisma.room.delete({ where: { id: params.id } }).catch(() => null);
  redirect("/admin/rooms");
}


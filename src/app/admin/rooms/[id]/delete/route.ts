import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await prisma.room.delete({ where: { id } }).catch(() => null);
  redirect("/admin/rooms");
}

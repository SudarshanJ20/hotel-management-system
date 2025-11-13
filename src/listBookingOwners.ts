import { prisma } from "@/lib/prisma";

async function run() {
  const rows = await prisma.booking.findMany({ select: { userId: true } });
  const countBy: Record<string, number> = {};
  for (const r of rows) {
    const key = r.userId ?? "NULL";
    countBy[key] = (countBy[key] || 0) + 1;
  }
  console.log(countBy);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

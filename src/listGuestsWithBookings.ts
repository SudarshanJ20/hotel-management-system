import { prisma } from "@/lib/prisma";

async function run() {
  const rows = await prisma.booking.findMany({
    select: { guestId: true, userId: true, id: true },
  });
  const map = new Map<string, { count: number; hasOwner: boolean }>();
  for (const r of rows) {
    if (!r.guestId) continue;
    const cur = map.get(r.guestId) ?? { count: 0, hasOwner: false };
    cur.count += 1;
    cur.hasOwner = cur.hasOwner || !!r.userId;
    map.set(r.guestId, cur);
  }
  const result = [...map.entries()].map(([guestId, info]) => ({ guestId, ...info }));
  console.log(result);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

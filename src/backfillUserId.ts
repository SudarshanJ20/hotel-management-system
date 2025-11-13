import { prisma } from "@/lib/prisma";

// Usage A: npx tsx src/backfillUserId.ts <userId> --all-null
// Usage B: npx tsx src/backfillUserId.ts <userId> --guest <guestId>
async function run() {
  const [, , userId, flag, value] = process.argv;
  if (!userId || !flag) {
    console.error("Usage:");
    console.error("  npx tsx src/backfillUserId.ts <userId> --all-null");
    console.error("  npx tsx src/backfillUserId.ts <userId> --guest <guestId>");
    process.exit(1);
  }

  if (flag === "--all-null") {
    const result = await prisma.booking.updateMany({
      where: { userId: null },
      data: { userId },
    });
    console.log(`Backfilled ${result.count} bookings (all with userId=null) to user ${userId}`);
    process.exit(0);
  }

  if (flag === "--guest") {
    const guestId = value;
    if (!guestId) {
      console.error("Provide a guestId after --guest");
      process.exit(1);
    }
    const result = await prisma.booking.updateMany({
      where: { userId: null, guestId },
      data: { userId },
    });
    console.log(`Backfilled ${result.count} bookings for guestId=${guestId} to user ${userId}`);
    process.exit(0);
  }

  console.error("Unknown flag:", flag);
  process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

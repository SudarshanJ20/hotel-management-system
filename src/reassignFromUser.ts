import { prisma } from "@/lib/prisma";

// Usage: npx tsx src/reassignFromUser.ts <fromUserId> <toUserId>
async function run() {
  const [, , fromUserId, toUserId] = process.argv;
  if (!fromUserId || !toUserId) {
    console.error("Usage: npx tsx src/reassignFromUser.ts <fromUserId> <toUserId>");
    process.exit(1);
  }

  const result = await prisma.booking.updateMany({
    where: { userId: fromUserId },
    data: { userId: toUserId },
  });

  console.log(`Reassigned ${result.count} bookings from ${fromUserId} to ${toUserId}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

import EditRoom from "./ui";
import { headers } from "next/headers";

function absolute(path: string) {
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}${path}`;
}

async function getRoom(id: string) {
  const res = await fetch(absolute(`/api/rooms/${id}`), { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditRoomPage({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  if (!room) return <div className="px-6 py-8">Not found</div>;
  return <EditRoom room={room} />;
}

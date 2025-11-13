import { auth } from "@/auth";
export default async function Page() {
  const s = await auth();
  return <pre className="p-6 text-sm">{JSON.stringify(s, null, 2)}</pre>;
}

// app/profile/page.tsx
import { auth } from "@/lib/auth";
import Image from "next/image";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const name = (user?.name as string) ?? "";
  const email = (user?.email as string) ?? "";
  const image = (user?.image as string) ?? "";

  // Fallback avatar: use local image or initials
  const initials =
    name
      ?.trim()
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || (email ? email[0].toUpperCase() : "U");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Profile</h1>
        <p className="text-white/70 mt-1">Manage your personal information.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-800 border border-white/15">
            {image ? (
              // Google / custom avatar
              <Image
                src={image}
                alt="avatar"
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            ) : (
              // Default avatar (no Google image)
              <div className="h-full w-full grid place-items-center bg-gradient-to-br from-cyan-500/70 via-sky-500/70 to-indigo-500/70 text-white text-lg font-semibold">
                {initials.slice(0, 2)}
              </div>
              // If you prefer a static picture instead of initials, replace the div above with:
              // <Image
              //   src="/default-avatar.png"
              //   alt="default avatar"
              //   width={64}
              //   height={64}
              //   className="h-full w-full object-cover"
              // />
            )}
          </div>
          <div>
            <div className="font-medium text-white">
              {name || "Unnamed user"}
            </div>
            <div className="text-sm text-white/70">{email}</div>
          </div>
        </div>

        <EditProfileForm initialName={name} initialImage={image} />
      </div>
    </div>
  );
}

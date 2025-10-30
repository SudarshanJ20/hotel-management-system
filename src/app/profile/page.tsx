// app/profile/page.tsx
import { auth } from "@/lib/auth";
import Image from "next/image";
import EditProfileForm from "@/components/profile/EditProfileForm";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  const name = user?.name ?? "";
  const email = user?.email ?? "";
  const image = user?.image ?? "";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-white/70 mt-1">Manage your personal information.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/50 p-5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-white/5 border border-white/10">
            {image ? (
              <Image src={image} alt="avatar" width={64} height={64} />
            ) : (
              <div className="h-full w-full grid place-items-center text-white/60 text-sm">No image</div>
            )}
          </div>
          <div>
            <div className="font-medium">{name || "Unnamed user"}</div>
            <div className="text-sm text-white/70">{email}</div>
          </div>
        </div>

        <EditProfileForm initialName={name} initialImage={image} />
      </div>
    </div>
  );
}

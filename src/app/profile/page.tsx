import { redirect } from "next/navigation";
import { getUser, getProfile } from "@/lib/auth";
import { Header } from "@/components/header";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await getProfile();

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Profil</h1>
        <p className="text-muted-foreground mb-8">
          Verwalte deine Profilinformationen
        </p>

        <ProfileForm
          initialData={{
            displayName: profile?.display_name || "",
            avatarUrl: profile?.avatar_url || "",
          }}
          email={user.email || ""}
        />
      </main>
    </div>
  );
}

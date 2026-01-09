import Link from "next/link";
import { getUser, getProfile } from "@/lib/auth";
import { UserNav } from "@/components/user-nav";

export async function Header() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;
  const logoHref = user ? "/dashboard" : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
        <Link href={logoHref} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">A</span>
          </div>
          <span className="font-semibold hidden sm:inline-block">Aufstellungsmaker</span>
        </Link>

        <UserNav profile={profile} email={user?.email} />
      </div>
    </header>
  );
}

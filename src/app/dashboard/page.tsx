import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/auth";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Share2, Calendar, Globe, User as UserIcon } from "lucide-react";
import type { CandidateList } from "@/lib/database.types";

export default async function DashboardPage() {
  const user = await getUser();
  const profile = await getProfile();
  const supabase = await createClient();

  let ownLists: (CandidateList & { profiles?: { display_name: string | null } })[] = [];
  let publicLists: (CandidateList & { profiles?: { display_name: string | null } })[] = [];

  if (user) {
    const { data: ownData } = await supabase
      .from("candidate_lists")
      .select("*, profiles(display_name)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    ownLists = ownData || [];

    const { data: publicData } = await supabase
      .from("candidate_lists")
      .select("*, profiles(display_name)")
      .eq("is_public", true)
      .neq("owner_id", user.id)
      .order("created_at", { ascending: false });

    publicLists = publicData || [];
  }

  const ListCard = ({ list, isOwn }: { list: CandidateList & { profiles?: { display_name: string | null } | null }; isOwn: boolean }) => (
    <Link key={list.id} href={`/list/${list.share_slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{list.title}</CardTitle>
            <div className="flex gap-2">
              {list.is_public && isOwn && (
                <Badge variant="outline" className="text-[10px] uppercase">
                  Öffentlich
                </Badge>
              )}
              {list.allow_player_adds && (
                <Badge variant="secondary" className="text-[10px] uppercase">
                  Offen
                </Badge>
              )}
            </div>
          </div>
          {list.description && (
            <CardDescription className="line-clamp-2">
              {list.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {!isOwn && list.profiles?.display_name && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <UserIcon className="w-3 h-3" />
                von {list.profiles.display_name}
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(list.created_at).toLocaleDateString("de-DE")}
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" />
                {list.share_slug}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {profile?.display_name ? `Hallo, ${profile.display_name.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              {user
                ? "Verwalte deine Spielerlisten und Aufstellungen"
                : "Melde dich an, um Listen zu speichern"}
            </p>
          </div>

          {user && (
            <Link href="/list/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Neue Liste
              </Button>
            </Link>
          )}
        </div>

        {!user && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg">Noch nicht angemeldet</h2>
                <p className="text-muted-foreground">
                  Mit einem Konto kannst du eigene Listen erstellen und speichern.
                </p>
              </div>
              <Link href="/login">
                <Button>Jetzt anmelden</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Own Lists Section */}
        {user && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Deine Listen
            </h2>
            {ownLists.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">Keine eigenen Listen</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Erstelle deine erste Spielerliste, um loszulegen.
                  </p>
                  <Link href="/list/new">
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Erste Liste erstellen
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {ownLists.map((list) => (
                  <ListCard key={list.id} list={list} isOwn={true} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Public Lists Section */}
        {user && publicLists.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Öffentliche Listen entdecken
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publicLists.map((list) => (
                <ListCard key={list.id} list={list} isOwn={false} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/auth";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Share2, Calendar } from "lucide-react";
import type { CandidateList } from "@/lib/database.types";

export default async function DashboardPage() {
  const user = await getUser();
  const profile = await getProfile();
  const supabase = await createClient();

  let candidateLists: CandidateList[] = [];

  if (user) {
    const { data } = await supabase
      .from("candidate_lists")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    candidateLists = data || [];
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
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
          <Card className="mb-8 border-primary/20 bg-primary/5">
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

        {user && candidateLists.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Keine Listen vorhanden</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Erstelle deine erste Spielerliste, um loszulegen. Du kannst Spieler manuell
                eingeben oder eine Liste kopieren und einfügen.
              </p>
              <Link href="/list/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Erste Liste erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {candidateLists.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {candidateLists.map((list) => (
              <Link key={list.id} href={`/list/${list.share_slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{list.title}</CardTitle>
                      {list.allow_player_adds && (
                        <Badge variant="secondary" className="ml-2">
                          Offen
                        </Badge>
                      )}
                    </div>
                    {list.description && (
                      <CardDescription className="line-clamp-2">
                        {list.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(list.created_at).toLocaleDateString("de-DE")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {list.share_slug}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

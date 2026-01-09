import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Plus, Settings, ArrowLeft } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";
import type { Candidate } from "@/lib/database.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch the candidate list with candidates
  const { data: list } = await supabase
    .from("candidate_lists")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (!list) {
    notFound();
  }

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("list_id", list.id)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  // Fetch lineups for this list
  const { data: lineupsData } = await supabase
    .from("lineups")
    .select("*, profiles(display_name)")
    .eq("list_id", list.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const lineups = lineupsData as {
    id: string;
    team_name: string;
    share_slug: string;
    created_at: string;
    profiles: { display_name: string | null } | null;
  }[] | null;

  const isOwner = user?.id === list.owner_id;

  // Group candidates by category
  const groupedCandidates = (candidates || []).reduce(
    (acc, candidate) => {
      const cat = candidate.category || "Ohne Kategorie";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(candidate);
      return acc;
    },
    {} as Record<string, Candidate[]>
  );

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zum Dashboard
              </Link>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold">{list.title}</h1>
                {isOwner && (
                  <Link href={`/list/${slug}/settings`}>
                    <Button variant="ghost" size="icon">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>
              {list.description && (
                <p className="text-muted-foreground mb-4">{list.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {candidates?.length || 0} Spieler
                </Badge>
                {list.allow_player_adds && (
                  <Badge variant="outline">Spieler können hinzugefügt werden</Badge>
                )}
              </div>
            </div>

            {/* Players List */}
            <Card>
              <CardHeader>
                <CardTitle>Spielerauswahl</CardTitle>
                <CardDescription>
                  Diese Spieler stehen für die Aufstellung zur Verfügung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {(Object.entries(groupedCandidates) as [string, Candidate[]][]).map(([category, categoryPlayers]) => (
                    <div key={category} className="mb-6">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide sticky top-0 bg-card py-1">
                        {category} ({categoryPlayers.length})
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categoryPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="p-2 rounded-lg bg-muted/50 text-sm truncate"
                            title={player.name}
                          >
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Create Lineup CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h2 className="font-semibold text-lg mb-2">Aufstellung erstellen</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Ziehe Spieler auf das Feld und erstelle deine eigene Aufstellung
                </p>
                <Link href={`/list/${slug}/lineup/new`}>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Neue Aufstellung
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liste teilen</CardTitle>
              </CardHeader>
              <CardContent>
                <CopyLinkButton slug={slug} />
              </CardContent>
            </Card>

            {/* Recent Lineups */}
            {lineups && lineups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Erstellte Aufstellungen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {lineups.map((lineup) => (
                    <Link
                      key={lineup.id}
                      href={`/lineup/${lineup.share_slug}`}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="font-medium text-sm">{lineup.team_name}</div>
                      <div className="text-xs text-muted-foreground">
                        von {lineup.profiles?.display_name || "Anonym"} •{" "}
                        {new Date(lineup.created_at).toLocaleDateString("de-DE")}
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

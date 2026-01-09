import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { FootballField, type PlayerPosition } from "@/components/football-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Plus, Users, Calendar, User, Pencil, GraduationCap } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";
import { ShareScreenshotButton } from "./share-screenshot-button";
import type { Lineup } from "@/lib/database.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LineupViewPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch the lineup with positions and candidates
  const { data: lineupData } = await supabase
    .from("lineups")
    .select(
      `
      *,
      profiles(display_name, avatar_url),
      candidate_lists(title, share_slug),
      trainers:candidates!lineups_trainer_id_fkey(id, name),
      lineup_positions(
        id,
        candidate_id,
        x_percent,
        y_percent,
        is_substitute,
        order_index,
        candidates(id, name, category)
      )
    `
    )
    .eq("share_slug", slug)
    .single();

  if (!lineupData) {
    notFound();
  }

  const lineup = lineupData as Lineup & {
    profiles: { display_name: string | null; avatar_url: string | null } | null;
    candidate_lists: { title: string; share_slug: string } | null;
    trainers: { id: string; name: string } | null;
    lineup_positions: {
      id: string;
      candidate_id: string;
      x_percent: number;
      y_percent: number;
      is_substitute: boolean;
      order_index: number;
      candidates: { id: string; name: string; category: string | null } | null;
    }[];
  };

  const isCreator = user?.id === lineup.creator_id;

  // Transform to PlayerPosition format
  const allPlayers: PlayerPosition[] = (lineup.lineup_positions || [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((pos) => ({
      id: pos.id,
      candidateId: pos.candidate_id,
      name: pos.candidates?.name || "Unbekannt",
      xPercent: pos.x_percent,
      yPercent: pos.y_percent,
      category: pos.candidates?.category,
    }));

  const fieldPlayers = allPlayers.filter(p => p.xPercent < 80);
  const substitutes = allPlayers.filter(p => p.xPercent >= 80);

  const list = lineup.candidate_lists;
  const creator = lineup.profiles;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link
                href={`/list/${list?.share_slug || ""}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Liste
              </Link>
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold">{lineup.team_name}</h1>
                {isCreator && (
                  <Link href={`/lineup/${slug}/edit`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-1" />
                      Bearbeiten
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {creator?.display_name && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{creator.display_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(lineup.created_at).toLocaleDateString("de-DE")}
                  </span>
                </div>
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  {fieldPlayers.length} Feld / {substitutes.length} Bank
                </Badge>
                {lineup.trainers && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Trainer: {lineup.trainers.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Football Field */}
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="max-w-[320px] sm:max-w-[380px] lg:max-w-[450px] mx-auto">
                  <FootballField players={allPlayers} readOnly />
                </div>
              </CardContent>
            </Card>

            {/* Substitutes List */}
            {substitutes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ersatzspieler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {substitutes.map((pos) => (
                      <Badge key={pos.id} variant="outline" className="text-sm py-1.5">
                        {pos.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Create Own Lineup CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h2 className="font-semibold text-lg mb-2">Eigene Aufstellung erstellen</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Erstelle deine eigene Version mit den gleichen Spielern
                </p>
                <Link href={`/list/${list?.share_slug || ""}/lineup/new`}>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Jetzt erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Aufstellung teilen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CopyLinkButton slug={slug} />
                <ShareScreenshotButton teamName={lineup.team_name} />
              </CardContent>
            </Card>

            {/* Players List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Spieler in dieser Aufstellung</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <ol className="space-y-2">
                    {fieldPlayers.map((player, index) => (
                      <li key={player.id} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{player.name}</span>
                        {player.category && (
                          <Badge variant="outline" className="text-xs ml-auto">
                            {player.category}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Source List Link */}
            {list && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-2">Aus der Spielerliste:</p>
                  <Link
                    href={`/list/${list.share_slug}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {list.title}
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

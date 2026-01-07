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
import { ArrowLeft, Plus, Users, Calendar, User, Pencil } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LineupViewPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch the lineup with positions and candidates
  const { data: lineup } = await supabase
    .from("lineups")
    .select(
      `
      *,
      profiles(display_name, avatar_url),
      candidate_lists(title, share_slug),
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

  if (!lineup) {
    notFound();
  }

  const isCreator = user?.id === lineup.creator_id;

  // Transform to PlayerPosition format
  const fieldPlayers: PlayerPosition[] = (lineup.lineup_positions || [])
    .filter((pos: any) => !pos.is_substitute)
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((pos: any) => ({
      id: pos.id,
      candidateId: pos.candidate_id,
      name: pos.candidates?.name || "Unbekannt",
      xPercent: pos.x_percent,
      yPercent: pos.y_percent,
      category: pos.candidates?.category,
    }));

  const substitutes = (lineup.lineup_positions || [])
    .filter((pos: any) => pos.is_substitute)
    .sort((a: any, b: any) => a.order_index - b.order_index);

  const list = lineup.candidate_lists as any;
  const creator = lineup.profiles as any;

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
                  {fieldPlayers.length} Spieler
                </Badge>
              </div>
            </div>

            {/* Football Field */}
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] mx-auto">
                  <FootballField players={fieldPlayers} readOnly />
                </div>
              </CardContent>
            </Card>

            {/* Substitutes */}
            {substitutes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ersatzspieler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {substitutes.map((pos: any) => (
                      <Badge key={pos.id} variant="outline" className="text-sm py-1.5">
                        {pos.candidates?.name || "Unbekannt"}
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
              <CardContent>
                <CopyLinkButton slug={slug} />
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

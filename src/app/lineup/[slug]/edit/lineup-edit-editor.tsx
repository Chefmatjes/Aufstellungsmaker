"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { FootballField, type PlayerPosition } from "@/components/football-field";
import { PlayerPool } from "@/components/player-pool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Users, RotateCcw, AlertCircle, Trash2 } from "lucide-react";
import type { Candidate, CandidateList, Lineup } from "@/lib/database.types";

interface LineupEditEditorProps {
  lineup: Lineup;
  list: CandidateList;
  candidates: Candidate[];
  existingPositions: PlayerPosition[];
  slug: string;
}

const MAX_PLAYERS = 11;

// Default positions for a 4-3-3 formation
const defaultPositions = [
  { x: 50, y: 90 },
  { x: 20, y: 70 },
  { x: 40, y: 75 },
  { x: 60, y: 75 },
  { x: 80, y: 70 },
  { x: 25, y: 50 },
  { x: 50, y: 55 },
  { x: 75, y: 50 },
  { x: 20, y: 25 },
  { x: 50, y: 20 },
  { x: 80, y: 25 },
];

export function LineupEditEditor({ 
  lineup, 
  list, 
  candidates, 
  existingPositions,
  slug 
}: LineupEditEditorProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState(lineup.team_name);
  const [players, setPlayers] = useState<PlayerPosition[]>(existingPositions);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = players.map((p) => p.candidateId);
  const canAddMore = players.length < MAX_PLAYERS;
  const isComplete = players.length === MAX_PLAYERS;
  const canSave = isComplete && teamName.trim();

  const handlePlayerSelect = useCallback((candidate: Candidate) => {
    setPlayers((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev;
      
      const positionIndex = prev.length;
      const position = defaultPositions[positionIndex] || {
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      };

      return [
        ...prev,
        {
          id: `pos-${Date.now()}-${candidate.id}`,
          candidateId: candidate.id,
          name: candidate.name,
          xPercent: position.x,
          yPercent: position.y,
          category: candidate.category,
        },
      ];
    });
  }, []);

  const handlePlayerMove = useCallback(
    (playerId: string, xPercent: number, yPercent: number) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, xPercent, yPercent } : p))
      );
    },
    []
  );

  const handlePlayerRemove = useCallback((playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Aufstellung zurücksetzen?")) {
      setPlayers(existingPositions);
      setTeamName(lineup.team_name);
    }
  }, [existingPositions, lineup.team_name]);

  const handleDelete = async () => {
    if (!confirm("Aufstellung wirklich löschen? Dies kann nicht rückgängig gemacht werden.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("lineups")
      .delete()
      .eq("id", lineup.id);

    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    router.push(`/list/${list.share_slug}`);
  };

  const handleSave = async () => {
    if (!teamName.trim()) {
      setError("Bitte gib einen Namen für deine Aufstellung ein");
      return;
    }
    if (players.length !== MAX_PLAYERS) {
      setError(`Bitte wähle genau ${MAX_PLAYERS} Spieler aus`);
      return;
    }

    setIsSaving(true);
    setError(null);

    const supabase = createClient();

    // Update the lineup name
    const { error: lineupError } = await supabase
      .from("lineups")
      .update({ team_name: teamName.trim() })
      .eq("id", lineup.id);

    if (lineupError) {
      setError(lineupError.message);
      setIsSaving(false);
      return;
    }

    // Delete existing positions
    const { error: deleteError } = await supabase
      .from("lineup_positions")
      .delete()
      .eq("lineup_id", lineup.id);

    if (deleteError) {
      setError(deleteError.message);
      setIsSaving(false);
      return;
    }

    // Insert new positions
    const positionsData = players.map((player, index) => ({
      lineup_id: lineup.id,
      candidate_id: player.candidateId,
      x_percent: player.xPercent,
      y_percent: player.yPercent,
      is_substitute: false,
      order_index: index,
    }));

    const { error: positionsError } = await supabase
      .from("lineup_positions")
      .insert(positionsData);

    if (positionsError) {
      setError(positionsError.message);
      setIsSaving(false);
      return;
    }

    router.push(`/lineup/${slug}`);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/lineup/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Aufstellung
          </Link>
          <h1 className="text-2xl font-bold">Aufstellung bearbeiten</h1>
          <p className="text-muted-foreground">{list.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-primary" : ""}
          >
            <Users className="w-3 h-3 mr-1" />
            {players.length} / {MAX_PLAYERS}
          </Badge>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Zurücksetzen
          </Button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,350px] gap-4 lg:gap-6">
        {/* Football Field Column */}
        <div className="space-y-4 order-2 lg:order-1">
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] mx-auto">
                <FootballField
                  players={players}
                  onPlayerMove={handlePlayerMove}
                  onPlayerRemove={handlePlayerRemove}
                />
              </div>
            </CardContent>
          </Card>

          {/* Team Name & Save */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="teamName" className="text-sm font-medium">
                  Name der Aufstellung <span className="text-destructive">*</span>
                </label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="z.B. Meine Traumelf"
                />
              </div>

              {!isComplete && players.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Wähle noch {MAX_PLAYERS - players.length} Spieler aus</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || isDeleting || !canSave}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isComplete ? "Änderungen speichern" : `Noch ${MAX_PLAYERS - players.length} Spieler wählen`}
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSaving || isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Player Pool Column */}
        <div className="order-1 lg:order-2">
          <PlayerPool
            candidates={candidates}
            selectedIds={selectedIds}
            onPlayerSelect={handlePlayerSelect}
            disabled={!canAddMore}
          />
        </div>
      </div>
    </div>
  );
}

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
  existingBenchPositions: PlayerPosition[];
  slug: string;
}

const MAX_FIELD_PLAYERS = 11;
const MAX_BENCH_PLAYERS = 5;

// Default positions for a 4-3-3 formation
const defaultPositions = [
  { x: 50, y: 90 }, // GK
  { x: 20, y: 70 }, // LB
  { x: 40, y: 75 }, // CB
  { x: 60, y: 75 }, // CB
  { x: 80, y: 70 }, // RB
  { x: 25, y: 50 }, // LM
  { x: 50, y: 55 }, // CM
  { x: 75, y: 50 }, // RM
  { x: 20, y: 25 }, // LW
  { x: 50, y: 20 }, // ST
  { x: 80, y: 25 }, // RW
];

export function LineupEditEditor({ 
  lineup, 
  list, 
  candidates, 
  existingPositions,
  existingBenchPositions,
  slug 
}: LineupEditEditorProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState(lineup.team_name);
  const [players, setPlayers] = useState<PlayerPosition[]>([...existingPositions, ...existingBenchPositions]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedIds = players.map((p) => p.candidateId);
  
  const requiresSubs = list.requires_substitutes;
  const totalMax = requiresSubs ? (MAX_FIELD_PLAYERS + MAX_BENCH_PLAYERS) : MAX_FIELD_PLAYERS;
  
  const fieldPlayersCount = players.filter(p => p.xPercent < 80).length;
  const benchPlayersCount = players.filter(p => p.xPercent >= 80).length;

  const canAddMore = selectedIds.length < totalMax;
  const isComplete = requiresSubs 
    ? (fieldPlayersCount === MAX_FIELD_PLAYERS && benchPlayersCount === MAX_BENCH_PLAYERS)
    : fieldPlayersCount === MAX_FIELD_PLAYERS;
    
  const canSave = isComplete && teamName.trim();

  const handlePlayerSelect = useCallback((candidate: Candidate) => {
    setPlayers((prev) => {
      if (prev.length >= totalMax) return prev;
      
      const onField = prev.filter(p => p.xPercent < 80).length;
      let x = 40;
      let y = 50;

      if (onField < MAX_FIELD_PLAYERS) {
        const pos = defaultPositions[onField] || { x: 40, y: 50 };
        x = pos.x * 0.8;
        y = pos.y;
      } else if (requiresSubs) {
        x = 90;
        y = 10 + (prev.length - MAX_FIELD_PLAYERS) * 15;
      }

      return [
        ...prev,
        {
          id: `pos-${Date.now()}-${candidate.id}`,
          candidateId: candidate.id,
          name: candidate.name,
          xPercent: x,
          yPercent: y,
          category: candidate.category,
        },
      ];
    });
  }, [totalMax, requiresSubs]);

  const handlePlayerMove = useCallback(
    (playerId: string, xPercent: number, yPercent: number) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, xPercent, yPercent } : p))
      );
    },
    []
  );

  const handlePlayerEndMove = useCallback(
    () => {
      // Zone switching is handled by xPercent natively now
    },
    []
  );

  const handlePlayerRemove = useCallback((playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  const handleReset = useCallback(() => {
    if (confirm("Aufstellung zurücksetzen?")) {
      setPlayers([...existingPositions, ...existingBenchPositions]);
      setTeamName(lineup.team_name);
    }
  }, [existingPositions, existingBenchPositions, lineup.team_name]);

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
    
    if (requiresSubs) {
      if (fieldPlayersCount !== MAX_FIELD_PLAYERS || benchPlayersCount !== MAX_BENCH_PLAYERS) {
        setError(`Bitte wähle 11 Startspieler und 5 Ersatzspieler aus (aktuell: ${fieldPlayersCount} + ${benchPlayersCount})`);
        return;
      }
    } else if (fieldPlayersCount !== MAX_FIELD_PLAYERS) {
      setError(`Bitte wähle genau ${MAX_FIELD_PLAYERS} Spieler aus`);
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
      is_substitute: player.xPercent >= 80,
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
            Feld: {fieldPlayersCount} / {MAX_FIELD_PLAYERS}
          </Badge>
          {requiresSubs && (
            <Badge 
              variant={benchPlayersCount === MAX_BENCH_PLAYERS ? "default" : "secondary"}
              className={benchPlayersCount === MAX_BENCH_PLAYERS ? "bg-primary" : ""}
            >
              Bank: {benchPlayersCount} / {MAX_BENCH_PLAYERS}
            </Badge>
          )}
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
              <div className="max-w-[320px] sm:max-w-[380px] lg:max-w-[450px] mx-auto">
                <FootballField
                  players={players}
                  onPlayerMove={handlePlayerMove}
                  onPlayerEndMove={handlePlayerEndMove}
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

              {!isComplete && selectedIds.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {requiresSubs 
                      ? `Noch ${MAX_FIELD_PLAYERS - fieldPlayersCount} Feldspieler und ${MAX_BENCH_PLAYERS - benchPlayersCount} Ersatzspieler wählen`
                      : `Wähle noch ${MAX_FIELD_PLAYERS - fieldPlayersCount} Spieler aus`
                    }
                  </span>
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
                      {isComplete ? "Änderungen speichern" : "Vervollständige die Aufstellung"}
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

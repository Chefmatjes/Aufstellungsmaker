"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/parse-players";
import { FootballField, type PlayerPosition } from "@/components/football-field";
import { PlayerPool } from "@/components/player-pool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Loader2, Users, RotateCcw, AlertCircle } from "lucide-react";
import type { Candidate, CandidateList } from "@/lib/database.types";

interface LineupEditorProps {
  list: CandidateList;
  candidates: Candidate[];
  userId: string | null;
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

export function LineupEditor({ list, candidates: initialCandidates, userId }: LineupEditorProps) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [teamName, setTeamName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [players, setPlayers] = useState<PlayerPosition[]>([]);
  const [benchPlayers, setBenchPlayers] = useState<PlayerPosition[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGuest = !userId;
  const selectedIds = [...players.map((p) => p.candidateId), ...benchPlayers.map((p) => p.candidateId)];
  
  const requiresSubs = list.requires_substitutes;
  const totalMax = requiresSubs ? (MAX_FIELD_PLAYERS + MAX_BENCH_PLAYERS) : MAX_FIELD_PLAYERS;
  
  const canAddMore = selectedIds.length < totalMax;
  const isComplete = requiresSubs 
    ? (players.length === MAX_FIELD_PLAYERS && benchPlayers.length === MAX_BENCH_PLAYERS)
    : players.length === MAX_FIELD_PLAYERS;
    
  const canSave = isComplete && teamName.trim() && (!isGuest || creatorName.trim());

  const handlePlayerAdd = async (name: string, category: string) => {
    // Check for duplicates again to be safe
    if (candidates.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("Dieser Spieler existiert bereits in der Liste.");
      return;
    }

    const supabase = createClient();
    
    const { data: newCandidate, error: addError } = await supabase
      .from("candidates")
      .insert({
        list_id: list.id,
        name,
        category,
        added_by: userId,
      })
      .select()
      .single();

    if (addError) {
      setError(`Fehler beim Hinzufügen: ${addError.message}`);
      return;
    }

    if (newCandidate) {
      setCandidates(prev => [...prev, newCandidate]);
      router.refresh(); 
    }
  };

  const handlePlayerSelect = useCallback((candidate: Candidate) => {
    setPlayers((prev) => {
      if (prev.length < MAX_FIELD_PLAYERS) {
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
      } else if (requiresSubs && benchPlayers.length < MAX_BENCH_PLAYERS) {
        setBenchPlayers(prevBench => [
          ...prevBench,
          {
            id: `pos-${Date.now()}-${candidate.id}`,
            candidateId: candidate.id,
            name: candidate.name,
            xPercent: 0,
            yPercent: 0,
            category: candidate.category,
          }
        ]);
        return prev;
      }
      return prev;
    });
  }, [requiresSubs, benchPlayers.length]);

  const handlePlayerMove = useCallback(
    (playerId: string, xPercent: number, yPercent: number) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, xPercent, yPercent } : p))
      );
    },
    []
  );

  const handlePlayerEndMove = useCallback(
    (playerId: string, xPercent: number, yPercent: number) => {
      // If dragged to the bottom of the field, move to bench
      if (requiresSubs && yPercent > 95) {
        setPlayers((prev) => {
          const player = prev.find(p => p.id === playerId);
          if (player && benchPlayers.length < MAX_BENCH_PLAYERS) {
            setBenchPlayers(prevBench => [...prevBench, player]);
            return prev.filter(p => p.id !== playerId);
          }
          return prev;
        });
      }
    },
    [requiresSubs, benchPlayers.length]
  );

  const handlePlayerRemove = useCallback((playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setBenchPlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  const handleMoveToField = useCallback((player: PlayerPosition) => {
    if (players.length < MAX_FIELD_PLAYERS) {
      const positionIndex = players.length;
      const position = defaultPositions[positionIndex] || { x: 50, y: 50 };
      
      setPlayers(prev => [...prev, { ...player, xPercent: position.x, yPercent: position.y }]);
      setBenchPlayers(prev => prev.filter(p => p.id !== player.id));
    }
  }, [players.length]);

  const handleReset = useCallback(() => {
    if (confirm("Aufstellung zurücksetzen?")) {
      setPlayers([]);
      setBenchPlayers([]);
    }
  }, []);

  const handleSave = async () => {
    if (!teamName.trim()) {
      setError("Bitte gib einen Namen für deine Aufstellung ein");
      return;
    }
    if (isGuest && !creatorName.trim()) {
      setError("Bitte gib deinen Namen ein");
      return;
    }
    
    if (requiresSubs) {
      if (players.length !== MAX_FIELD_PLAYERS || benchPlayers.length !== MAX_BENCH_PLAYERS) {
        setError(`Bitte wähle 11 Startspieler und 5 Ersatzspieler aus (aktuell: ${players.length} + ${benchPlayers.length})`);
        return;
      }
    } else if (players.length !== MAX_FIELD_PLAYERS) {
      setError(`Bitte wähle genau ${MAX_FIELD_PLAYERS} Spieler aus`);
      return;
    }

    setIsSaving(true);
    setError(null);

    const supabase = createClient();
    const slug = generateSlug(teamName);

    const finalTeamName = isGuest 
      ? `${teamName.trim()} (von ${creatorName.trim()})`
      : teamName.trim();

    const { data: lineup, error: lineupError } = await supabase
      .from("lineups")
      .insert({
        list_id: list.id,
        creator_id: userId,
        team_name: finalTeamName,
        share_slug: slug,
      })
      .select()
      .single();

    if (lineupError) {
      setError(lineupError.message);
      setIsSaving(false);
      return;
    }

    const fieldPositions = players.map((player, index) => ({
      lineup_id: lineup.id,
      candidate_id: player.candidateId,
      x_percent: player.xPercent,
      y_percent: player.yPercent,
      is_substitute: false,
      order_index: index,
    }));

    const benchPositions = benchPlayers.map((player, index) => ({
      lineup_id: lineup.id,
      candidate_id: player.candidateId,
      x_percent: 0,
      y_percent: 0,
      is_substitute: true,
      order_index: index,
    }));

    const { error: positionsError } = await supabase
      .from("lineup_positions")
      .insert([...fieldPositions, ...benchPositions]);

    if (positionsError) {
      setError(positionsError.message);
      setIsSaving(false);
      return;
    }

    router.push(`/lineup/${slug}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/list/${list.share_slug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Liste
          </Link>
          <h1 className="text-2xl font-bold">Aufstellung erstellen</h1>
          <p className="text-muted-foreground">{list.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={isComplete ? "default" : "secondary"}
            className={isComplete ? "bg-primary" : ""}
          >
            <Users className="w-3 h-3 mr-1" />
            {selectedIds.length} / {totalMax}
          </Badge>
          {(players.length > 0 || benchPlayers.length > 0) && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Zurücksetzen
            </Button>
          )}
        </div>
      </div>

      {/* Editor Grid - Field left, Pool right on desktop */}
      <div className="grid lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,350px] gap-4 lg:gap-6">
        {/* Football Field Column */}
        <div className="space-y-4 order-2 lg:order-1">
          <Card>
            <CardContent className="p-2 sm:p-4">
              <div className="max-w-[280px] sm:max-w-[320px] lg:max-w-[380px] mx-auto">
                <FootballField
                  players={players}
                  onPlayerMove={handlePlayerMove}
                  onPlayerEndMove={handlePlayerEndMove}
                  onPlayerRemove={handlePlayerRemove}
                />
              </div>

              {requiresSubs && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center justify-between">
                    Ersatzbank
                    <span className="text-xs font-normal text-muted-foreground">
                      {benchPlayers.length} / {MAX_BENCH_PLAYERS}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg min-h-[64px]">
                    {benchPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="relative group cursor-pointer"
                        onClick={() => handleMoveToField(player)}
                        title="Auf das Feld schieben"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow hover:scale-105 transition-transform">
                          {player.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <button
                          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayerRemove(player.id);
                          }}
                        >
                          ×
                        </button>
                        <div className="mt-1 text-[10px] text-center truncate max-w-[40px]">
                          {player.name.split(" ").pop()}
                        </div>
                      </div>
                    ))}
                    {benchPlayers.length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground italic">
                        Ziehe Spieler vom Feld hierher
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Name & Save */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Guest Name Field */}
              {isGuest && (
                <div className="space-y-2">
                  <label htmlFor="creatorName" className="text-sm font-medium">
                    Dein Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="creatorName"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="z.B. Max Mustermann"
                  />
                </div>
              )}

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
                      ? `Noch ${MAX_FIELD_PLAYERS - players.length} Feldspieler und ${MAX_BENCH_PLAYERS - benchPlayers.length} Ersatzspieler wählen`
                      : `Wähle noch ${MAX_FIELD_PLAYERS - players.length} Spieler aus`
                    }
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving || !canSave}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isComplete ? "Aufstellung speichern" : "Vervollständige die Aufstellung"}
                  </>
                )}
              </Button>
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
            allowPlayerAdds={list.allow_player_adds}
            onPlayerAdd={handlePlayerAdd}
          />
        </div>
      </div>
    </div>
  );
}

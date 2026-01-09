"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FootballField, type PlayerPosition } from "@/components/football-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Calendar, GraduationCap, ListChecks } from "lucide-react";
import type { Candidate, Lineup, LineupPosition } from "@/lib/database.types";

export interface ComparisonLineup extends Lineup {
  profiles: { display_name: string | null } | null;
  trainers: { id: string; name: string } | null;
  lineup_positions?: (LineupPosition & {
    candidates: Candidate | null;
  })[];
}

interface ComparisonViewProps {
  initialLineups: ComparisonLineup[];
}

export function ComparisonView({ initialLineups }: ComparisonViewProps) {
  const [lineup1Id, setLineup1Id] = useState<string>(initialLineups[0]?.id || "");
  const [lineup2Id, setLineup2Id] = useState<string>(initialLineups[1]?.id || "");
  
  const [lineup1Data, setLineup1Data] = useState<ComparisonLineup | null>(null);
  const [lineup2Data, setLineup2Data] = useState<ComparisonLineup | null>(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const fetchLineup = async (id: string, setter: (data: ComparisonLineup) => void, setLoading: (l: boolean) => void) => {
    if (!id) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("lineups")
      .select(`
        *,
        profiles(display_name),
        trainers:candidates!lineups_trainer_id_fkey(id, name),
        lineup_positions(
          id,
          candidate_id,
          x_percent,
          y_percent,
          is_substitute,
          candidates(id, name, category)
        )
      `)
      .eq("id", id)
      .single();
    
    if (data) setter(data as ComparisonLineup);
    setLoading(false);
  };

  useEffect(() => {
    fetchLineup(lineup1Id, setLineup1Data, setLoading1);
  }, [lineup1Id]);

  useEffect(() => {
    fetchLineup(lineup2Id, setLineup2Data, setLoading2);
  }, [lineup2Id]);

  const transformPositions = (lineup: ComparisonLineup | null): PlayerPosition[] => {
    if (!lineup || !lineup.lineup_positions) return [];
    return lineup.lineup_positions
      .map(pos => ({
        id: pos.id,
        candidateId: pos.candidate_id,
        name: pos.candidates?.name || "Unbekannt",
        xPercent: pos.x_percent,
        yPercent: pos.y_percent,
        category: pos.candidates?.category,
      }));
  };

  const renderLineupSide = (
    lineup: ComparisonLineup | null, 
    loading: boolean, 
    selectedId: string, 
    onSelect: (id: string) => void
  ) => {
    const players = transformPositions(lineup);
    const substitutes = lineup?.lineup_positions?.filter(pos => pos.is_substitute) || [];

    return (
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-xl border shadow-sm">
          <label className="text-sm font-medium mb-2 block">Aufstellung wählen</label>
          <select 
            value={selectedId} 
            onChange={(e) => onSelect(e.target.value)}
            className="w-full p-2 rounded-md border bg-background"
          >
            {initialLineups.map(l => (
              <option key={l.id} value={l.id}>
                {l.team_name} ({l.profiles?.display_name || "Anonym"})
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-muted/50 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : lineup ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="max-w-[500px] mx-auto">
                  <FootballField players={players} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Aufstellung Details
                  <Badge variant="secondary">
                    {players.length} Spieler gesamt
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="truncate">von {lineup.profiles?.display_name || "Anonym"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground justify-end">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(lineup.created_at).toLocaleDateString("de-DE")}</span>
                  </div>
                </div>
                
                {lineup.trainers && (
                  <div className="flex items-center gap-2 p-2 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 font-medium">
                    <GraduationCap className="w-4 h-4" />
                    <span>Trainer: {lineup.trainers.name}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <ListChecks className="w-4 h-4" />
                    <span>Spielerliste</span>
                  </div>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Startelf</div>
                        <div className="space-y-1">
                          {players.filter(p => p.xPercent < 80).map((p, idx) => (
                            <div key={p.id} className="flex items-center justify-between py-0.5 border-b border-muted/50 last:border-0 text-xs">
                              <span className="flex items-center gap-2">
                                <span className="w-4 text-muted-foreground">{idx + 1}.</span>
                                <span className="font-medium">{p.name}</span>
                              </span>
                              {p.category && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                  {p.category}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {substitutes.length > 0 && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Ersatzbank</div>
                          <div className="space-y-1">
                            {substitutes.map(sub => (
                              <div key={sub.id} className="flex items-center justify-between py-0.5 border-b border-muted/50 last:border-0 text-xs italic text-muted-foreground">
                                <span>{sub.candidates?.name}</span>
                                {sub.candidates?.category && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 opacity-70">
                                    {sub.candidates?.category}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {renderLineupSide(lineup1Data, loading1, lineup1Id, setLineup1Id)}
      {renderLineupSide(lineup2Data, loading2, lineup2Id, setLineup2Id)}
    </div>
  );
}

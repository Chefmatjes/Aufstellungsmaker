"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { FootballField, type PlayerPosition } from "@/components/football-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Calendar } from "lucide-react";
import type { Candidate, Lineup, LineupPosition } from "@/lib/database.types";

export interface ComparisonLineup extends Lineup {
  profiles: { display_name: string | null } | null;
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
      .filter(pos => !pos.is_substitute)
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
          <div className="aspect-[68/105] flex items-center justify-center bg-muted/50 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : lineup ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="max-w-[280px] mx-auto">
                  <FootballField players={players} readOnly />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  Details
                  <Badge variant="outline" className="font-normal">
                    {players.length} Spieler
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>von {lineup.profiles?.display_name || "Anonym"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(lineup.created_at).toLocaleDateString("de-DE")}</span>
                </div>
                
                {substitutes.length > 0 && (
                  <div className="pt-2">
                    <div className="font-medium mb-1">Ersatzspieler:</div>
                    <div className="flex flex-wrap gap-1">
                      {substitutes.map(sub => (
                        <Badge key={sub.id} variant="secondary" className="text-[10px]">
                          {sub.candidates?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
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

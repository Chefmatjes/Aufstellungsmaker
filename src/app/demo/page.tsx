"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { FootballField, type PlayerPosition } from "@/components/football-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Users, RotateCcw, Sparkles } from "lucide-react";

// Demo data: German national team players
const demoPlayers = [
  { id: "1", name: "Manuel Neuer", category: "Tor" },
  { id: "2", name: "Oliver Kahn", category: "Tor" },
  { id: "3", name: "Philipp Lahm", category: "Abwehr" },
  { id: "4", name: "Franz Beckenbauer", category: "Abwehr" },
  { id: "5", name: "Mats Hummels", category: "Abwehr" },
  { id: "6", name: "Andreas Brehme", category: "Abwehr" },
  { id: "7", name: "Lothar Matthäus", category: "Mittelfeld" },
  { id: "8", name: "Bastian Schweinsteiger", category: "Mittelfeld" },
  { id: "9", name: "Toni Kroos", category: "Mittelfeld" },
  { id: "10", name: "Thomas Müller", category: "Mittelfeld" },
  { id: "11", name: "Mesut Özil", category: "Mittelfeld" },
  { id: "12", name: "Miroslav Klose", category: "Sturm" },
  { id: "13", name: "Gerd Müller", category: "Sturm" },
  { id: "14", name: "Jürgen Klinsmann", category: "Sturm" },
  { id: "15", name: "Rudi Völler", category: "Sturm" },
];

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

const MAX_PLAYERS = 11;

export default function DemoPage() {
  const [players, setPlayers] = useState<PlayerPosition[]>([]);

  const selectedIds = players.map((p) => p.candidateId);
  const canAddMore = players.length < MAX_PLAYERS;
  const isComplete = players.length === MAX_PLAYERS;

  const handlePlayerSelect = useCallback((player: (typeof demoPlayers)[0]) => {
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
          id: `pos-${Date.now()}-${player.id}`,
          candidateId: player.id,
          name: player.name,
          xPercent: position.x,
          yPercent: position.y,
          category: player.category,
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
    setPlayers([]);
  }, []);

  // Group demo players by category
  const groupedPlayers = demoPlayers.reduce(
    (acc, player) => {
      if (!acc[player.category]) acc[player.category] = [];
      acc[player.category].push(player);
      return acc;
    },
    {} as Record<string, typeof demoPlayers>
  );

  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("tor")) return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
    if (cat.includes("abwehr")) return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (cat.includes("mittelfeld")) return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
    if (cat.includes("sturm")) return "bg-rose-500/20 text-rose-700 dark:text-rose-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">A</span>
            </div>
            <span className="font-semibold hidden sm:inline-block">Aufstellungsmaker</span>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              <Sparkles className="w-3 h-3 mr-1" />
              Demo-Modus
            </Badge>
            <Link href="/login">
              <Button size="sm">Anmelden & Speichern</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </Link>
              <h1 className="text-2xl font-bold">Demo: Deutsche Legenden</h1>
              <p className="text-muted-foreground">
                Probiere den Editor aus – klicke auf Spieler und ziehe sie auf dem Feld
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={isComplete ? "default" : "secondary"}
                className={isComplete ? "bg-primary" : ""}
              >
                <Users className="w-3 h-3 mr-1" />
                {players.length} / {MAX_PLAYERS}
              </Badge>
              {players.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Zurücksetzen
                </Button>
              )}
            </div>
          </div>

          {/* Editor Grid */}
          <div className="grid lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,350px] gap-4 lg:gap-6">
            {/* Football Field */}
            <Card className="order-2 lg:order-1">
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

            {/* Player Pool */}
            <div className="bg-card rounded-lg border order-1 lg:order-2">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Spielerauswahl</h3>
                <p className="text-sm text-muted-foreground">
                  {!canAddMore 
                    ? "Aufstellung komplett – entferne Spieler um andere zu wählen"
                    : "Klicke auf einen Spieler, um ihn hinzuzufügen"
                  }
                </p>
              </div>
              <ScrollArea className="h-[400px] lg:h-[600px]">
                <div className="p-4 space-y-6">
                  {Object.entries(groupedPlayers).map(([category, categoryPlayers]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className={getCategoryColor(category)}>
                          {category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categoryPlayers.map((player) => {
                          const isSelected = selectedIds.includes(player.id);
                          const isDisabled = isSelected || !canAddMore;
                          return (
                            <button
                              key={player.id}
                              onClick={() => !isDisabled && handlePlayerSelect(player)}
                              disabled={isDisabled}
                              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                                isSelected
                                  ? "bg-primary/20 text-primary cursor-not-allowed line-through"
                                  : isDisabled
                                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                  : "bg-secondary hover:bg-secondary/80 hover:scale-105 cursor-pointer"
                              }`}
                            >
                              {player.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold text-lg">Gefällt dir der Editor?</h2>
                <p className="text-muted-foreground">
                  Melde dich an, um eigene Spielerlisten zu erstellen und zu teilen.
                </p>
              </div>
              <Link href="/login">
                <Button size="lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Jetzt starten
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

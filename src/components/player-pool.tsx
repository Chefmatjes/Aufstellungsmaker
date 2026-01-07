"use client";

import { useState, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import type { Candidate } from "@/lib/database.types";

interface PlayerPoolProps {
  candidates: Candidate[];
  selectedIds: string[];
  onPlayerSelect: (candidate: Candidate) => void;
  className?: string;
  disabled?: boolean;
  allowPlayerAdds?: boolean;
  onPlayerAdd?: (name: string, category: string) => Promise<void>;
}

export function PlayerPool({
  candidates,
  selectedIds,
  onPlayerSelect,
  className,
  disabled = false,
  allowPlayerAdds = false,
  onPlayerAdd,
}: PlayerPoolProps) {
  const [newPlayerNames, setNewPlayerInputs] = useState<Record<string, string>>({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

  // Group candidates by category
  const groupedCandidates = candidates.reduce(
    (acc, candidate) => {
      const cat = candidate.category || "Ohne Kategorie";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(candidate);
      return acc;
    },
    {} as Record<string, Candidate[]>
  );

  // Define category order
  const categoryOrder = ["Tor", "Abwehr", "Mittelfeld", "Sturm", "Ohne Kategorie"];
  
  // Ensure the base categories exist if allowPlayerAdds is true
  if (allowPlayerAdds) {
    categoryOrder.slice(0, 4).forEach(cat => {
      if (!groupedCandidates[cat]) groupedCandidates[cat] = [];
    });
  }

  const sortedCategories = Object.keys(groupedCandidates).sort((a, b) => {
    const aIndex = categoryOrder.findIndex((c) => a.toLowerCase().includes(c.toLowerCase()));
    const bIndex = categoryOrder.findIndex((c) => b.toLowerCase().includes(c.toLowerCase()));
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const handleAddPlayer = async (category: string) => {
    const name = newPlayerNames[category]?.trim();
    if (!name || !onPlayerAdd) return;

    // Check for duplicates
    if (candidates.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert("Dieser Spieler existiert bereits in der Liste.");
      return;
    }

    setIsAdding(prev => ({ ...prev, [category]: true }));
    try {
      await onPlayerAdd(name, category);
      setNewPlayerInputs(prev => ({ ...prev, [category]: "" }));
    } finally {
      setIsAdding(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, category: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPlayer(category);
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("tor")) return "bg-amber-500/20 text-amber-700 dark:text-amber-400";
    if (cat.includes("abwehr") || cat.includes("verteidigung"))
      return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (cat.includes("mittelfeld"))
      return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400";
    if (cat.includes("sturm") || cat.includes("angriff"))
      return "bg-rose-500/20 text-rose-700 dark:text-rose-400";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className={cn("bg-card rounded-lg border flex flex-col", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold">Spielerauswahl</h3>
        <p className="text-sm text-muted-foreground">
          {disabled 
            ? "Aufstellung komplett – entferne Spieler um andere zu wählen"
            : "Klicke auf einen Spieler, um ihn zur Aufstellung hinzuzufügen"
          }
        </p>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {sortedCategories.map((category) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getCategoryColor(category)}>
                  {category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ({groupedCandidates[category].length})
                </span>
              </div>

              {/* Add inline player input if allowed */}
              {allowPlayerAdds && category !== "Ohne Kategorie" && (
                <div className="flex gap-2 mb-2">
                  <Input
                    size={32}
                    value={newPlayerNames[category] || ""}
                    onChange={(e) => setNewPlayerInputs(prev => ({ ...prev, [category]: e.target.value }))}
                    onKeyDown={(e) => handleKeyDown(e, category)}
                    placeholder="Spieler hinzufügen..."
                    className="h-8 text-sm"
                    disabled={isAdding[category]}
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => handleAddPlayer(category)}
                    disabled={!newPlayerNames[category]?.trim() || isAdding[category]}
                  >
                    {isAdding[category] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {groupedCandidates[category].map((candidate) => {
                  const isSelected = selectedIds.includes(candidate.id);
                  const isDisabled = isSelected || disabled;
                  return (
                    <button
                      key={candidate.id}
                      onClick={() => !isDisabled && onPlayerSelect(candidate)}
                      disabled={isDisabled}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-all",
                        isSelected
                          ? "bg-primary/20 text-primary cursor-not-allowed line-through"
                          : isDisabled
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "bg-secondary hover:bg-secondary/80 hover:scale-105 cursor-pointer"
                      )}
                    >
                      {candidate.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


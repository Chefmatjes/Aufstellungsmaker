"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/parse-players";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, X, Plus } from "lucide-react";

interface Player {
  name: string;
  category: string;
}

const CATEGORIES = [
  { id: "Tor", label: "Tor", color: "bg-amber-500/20 text-amber-700 dark:text-amber-400" },
  { id: "Abwehr", label: "Abwehr", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  { id: "Mittelfeld", label: "Mittelfeld", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
  { id: "Sturm", label: "Sturm", color: "bg-rose-500/20 text-rose-700 dark:text-rose-400" },
];

export function CreateListForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [allowPlayerAdds, setAllowPlayerAdds] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerInputs, setNewPlayerInputs] = useState<Record<string, string>>({
    Tor: "",
    Abwehr: "",
    Mittelfeld: "",
    Sturm: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPlayer = (category: string) => {
    const name = newPlayerInputs[category]?.trim();
    if (!name) return;

    // Check for duplicates
    if (players.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setError(`Spieler "${name}" ist bereits in der Liste`);
      return;
    }

    setError(null);
    setPlayers((prev) => [...prev, { name, category }]);
    setNewPlayerInputs((prev) => ({ ...prev, [category]: "" }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, category: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPlayer(category);
    }
  };

  const handleRemovePlayer = (playerName: string, category: string) => {
    setPlayers((prev) => prev.filter((p) => !(p.name === playerName && p.category === category)));
  };

  const handleBulkAdd = (category: string, text: string) => {
    const names = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !players.some((p) => p.name.toLowerCase() === line.toLowerCase()));

    if (names.length > 0) {
      setPlayers((prev) => [...prev, ...names.map((name) => ({ name, category }))]);
    }
  };

  const getPlayersForCategory = (category: string) => {
    return players.filter((p) => p.category === category);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Bitte gib einen Titel ein");
      return;
    }
    if (players.length === 0) {
      setError("Bitte füge mindestens einen Spieler hinzu");
      return;
    }

    setIsSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Nicht angemeldet");
      setIsSaving(false);
      return;
    }

    const slug = generateSlug(title);

    // Create the candidate list
    const { data: list, error: listError } = await supabase
      .from("candidate_lists")
      .insert({
        owner_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        allow_player_adds: allowPlayerAdds,
        share_slug: slug,
      })
      .select()
      .single();

    if (listError) {
      setError(listError.message);
      setIsSaving(false);
      return;
    }

    // Insert all candidates
    const candidatesData = players.map((player) => ({
      list_id: list.id,
      name: player.name,
      category: player.category,
      added_by: user.id,
    }));

    const { error: candidatesError } = await supabase.from("candidates").insert(candidatesData);

    if (candidatesError) {
      setError(candidatesError.message);
      setIsSaving(false);
      return;
    }

    router.push(`/list/${slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Gib deiner Liste einen Namen und eine optionale Beschreibung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Titel <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Beste Deutsche Nationalelf aller Zeiten"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Beschreibung
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Wähle die Top-11 plus 5 Ersatzspieler ab 1990"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="allowAdds"
              checked={allowPlayerAdds}
              onChange={(e) => setAllowPlayerAdds(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="allowAdds" className="text-sm">
              Andere dürfen Spieler vorschlagen
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {CATEGORIES.map((category) => {
          const categoryPlayers = getPlayersForCategory(category.id);
          return (
            <Card key={category.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={category.color}>
                    {category.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {categoryPlayers.length} Spieler
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Player list */}
                {categoryPlayers.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {categoryPlayers.map((player) => (
                      <div
                        key={player.name}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-sm"
                      >
                        <span>{player.name}</span>
                        <button
                          onClick={() => handleRemovePlayer(player.name, category.id)}
                          className="w-4 h-4 rounded-full hover:bg-destructive/20 flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add player input */}
                <div className="flex gap-2">
                  <Input
                    value={newPlayerInputs[category.id]}
                    onChange={(e) =>
                      setNewPlayerInputs((prev) => ({ ...prev, [category.id]: e.target.value }))
                    }
                    onKeyDown={(e) => handleKeyDown(e, category.id)}
                    placeholder="Spielername eingeben..."
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleAddPlayer(category.id)}
                    disabled={!newPlayerInputs[category.id]?.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Bulk paste hint */}
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    Mehrere Spieler auf einmal einfügen?
                  </summary>
                  <div className="mt-2 space-y-2">
                    <Textarea
                      placeholder="Namen einfügen (einer pro Zeile)"
                      rows={4}
                      className="text-sm"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          handleBulkAdd(category.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                </details>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Users className="w-3 h-3 mr-1" />
                {players.length} Spieler gesamt
              </Badge>
              {CATEGORIES.map((cat) => {
                const count = getPlayersForCategory(cat.id).length;
                if (count === 0) return null;
                return (
                  <Badge key={cat.id} variant="outline" className={cat.color}>
                    {cat.label}: {count}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <Button 
        onClick={handleSave} 
        disabled={isSaving || !title.trim() || players.length === 0}
        size="lg"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Speichern...
          </>
        ) : (
          "Liste erstellen"
        )}
      </Button>
    </div>
  );
}

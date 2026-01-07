"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import type { CandidateList } from "@/lib/database.types";

interface ListSettingsFormProps {
  list: CandidateList;
  slug: string;
}

export function ListSettingsForm({ list, slug }: ListSettingsFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || "");
  const [allowPlayerAdds, setAllowPlayerAdds] = useState(list.allow_player_adds);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Titel ist erforderlich");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("candidate_lists")
      .update({
        title: title.trim(),
        description: description.trim() || null,
        allow_player_adds: allowPlayerAdds,
      })
      .eq("id", list.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      router.refresh();
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Liste wirklich löschen? Alle Aufstellungen werden ebenfalls gelöscht. Dies kann nicht rückgängig gemacht werden.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const supabase = createClient();

    const { error: deleteError } = await supabase
      .from("candidate_lists")
      .delete()
      .eq("id", list.id);

    if (deleteError) {
      setError(deleteError.message);
      setIsDeleting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/list/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Liste
        </Link>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">{list.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allgemein</CardTitle>
          <CardDescription>Grundlegende Informationen zur Liste</CardDescription>
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
              placeholder="z.B. Beste Deutsche Nationalelf"
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
              placeholder="Optionale Beschreibung..."
              rows={3}
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

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-primary/10 text-primary text-sm">
              Änderungen gespeichert
            </div>
          )}

          <Button onClick={handleSave} disabled={isSaving || isDeleting}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Gefahrenzone</CardTitle>
          <CardDescription>
            Diese Aktion kann nicht rückgängig gemacht werden
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Das Löschen der Liste entfernt auch alle zugehörigen Spieler und Aufstellungen.
          </p>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Löschen...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Liste löschen
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

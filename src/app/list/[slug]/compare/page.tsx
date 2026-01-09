import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ArrowLeft, Users } from "lucide-react";
import { ComparisonView, type ComparisonLineup } from "./comparison-view";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch the list
  const { data: list } = await supabase
    .from("candidate_lists")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (!list) {
    notFound();
  }

  // Fetch all lineups for this list
  const { data: lineups } = await supabase
    .from("lineups")
    .select("*, profiles(display_name), trainers:candidates!lineups_trainer_id_fkey(id, name)")
    .eq("list_id", list.id)
    .order("created_at", { ascending: false });

  if (!lineups || lineups.length < 2) {
    // You need at least 2 lineups to compare
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/list/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zur Liste
          </Link>
          <h1 className="text-3xl font-bold">Aufstellungen vergleichen</h1>
          <p className="text-muted-foreground">{list.title}</p>
        </div>

        {lineups && lineups.length >= 2 ? (
          <ComparisonView initialLineups={lineups as unknown as ComparisonLineup[]} />
        ) : (
          <div className="bg-card rounded-xl border p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nicht genug Aufstellungen</h2>
            <p className="text-muted-foreground mb-6">
              Es müssen mindestens zwei Aufstellungen erstellt werden, um sie vergleichen zu können.
            </p>
            <Link href={`/list/${slug}/lineup/new`}>
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                Erste Aufstellung erstellen
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

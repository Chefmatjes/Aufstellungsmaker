import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { LineupEditEditor } from "./lineup-edit-editor";
import type { Candidate, CandidateList, Lineup } from "@/lib/database.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditLineupPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch the lineup with positions and candidates
  const { data: lineup } = await supabase
    .from("lineups")
    .select(
      `
      *,
      candidate_lists(*, candidates(*)),
      lineup_positions(
        id,
        candidate_id,
        x_percent,
        y_percent,
        is_substitute,
        order_index,
        candidates(id, name, category)
      )
    `
    )
    .eq("share_slug", slug)
    .single();

  if (!lineup) {
    notFound();
  }

  // Only creator can edit
  if (lineup.creator_id !== user?.id) {
    redirect(`/lineup/${slug}`);
  }

  const list = lineup.candidate_lists as any;
  const candidates = list?.candidates || [];

  // Transform existing positions
  const existingPositions = (lineup.lineup_positions || [])
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map((pos: any) => ({
      id: pos.id,
      candidateId: pos.candidate_id,
      name: pos.candidates?.name || "Unbekannt",
      xPercent: pos.x_percent,
      yPercent: pos.y_percent,
      category: pos.candidates?.category,
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8">
        <LineupEditEditor
          lineup={lineup as Lineup}
          list={list as CandidateList}
          candidates={candidates as Candidate[]}
          existingPositions={existingPositions}
          slug={slug}
        />
      </main>
    </div>
  );
}

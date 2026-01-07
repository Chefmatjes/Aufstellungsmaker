import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { LineupEditor } from "./lineup-editor";
import type { Candidate, CandidateList } from "@/lib/database.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewLineupPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  // Fetch the candidate list with candidates
  const { data: list } = await supabase
    .from("candidate_lists")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (!list) {
    notFound();
  }

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .eq("list_id", list.id)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8">
        <LineupEditor
          list={list as CandidateList}
          candidates={(candidates as Candidate[]) || []}
          userId={user?.id || null}
        />
      </main>
    </div>
  );
}

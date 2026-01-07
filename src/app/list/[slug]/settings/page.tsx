import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { ListSettingsForm } from "./list-settings-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ListSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: list } = await supabase
    .from("candidate_lists")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (!list) {
    notFound();
  }

  // Only owner can access settings
  if (list.owner_id !== user.id) {
    redirect(`/list/${slug}`);
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container py-8 max-w-2xl">
        <ListSettingsForm list={list} slug={slug} />
      </main>
    </div>
  );
}

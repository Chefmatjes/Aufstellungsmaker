import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { CreateListForm } from "./create-list-form";

export default async function NewListPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login?next=/list/new");
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Neue Spielerliste</h1>
        <p className="text-muted-foreground mb-8">
          Erstelle eine Liste mit Spielern, aus denen Aufstellungen gebaut werden können
        </p>

        <CreateListForm />
      </main>
    </div>
  );
}

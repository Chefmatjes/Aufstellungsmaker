import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
        <p className="text-muted-foreground mb-8">
          Verwalte deine Kontoeinstellungen
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Konto</CardTitle>
            <CardDescription>
              Einstellungen für dein Benutzerkonto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Weitere Einstellungen werden in Zukunft hinzugefügt.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

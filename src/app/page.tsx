import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Share2, Smartphone, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 football-field opacity-20" />
        <div className="relative z-10 container mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-semibold text-xl">Aufstellungsmaker</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost">Anmelden</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Loslegen</Button>
              </Link>
            </div>
          </nav>

          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Deine <span className="text-primary">Traumelf</span> in Sekunden
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Erstelle Spielerlisten, baue Aufstellungen per Drag & Drop und teile sie mit
              Freunden. Perfekt für WM-Tipprunden, Vereins-Diskussionen oder die ewige Frage:
              Wer ist der Beste aller Zeiten?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8">
                  Jetzt starten
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Demo ansehen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">So funktioniert&apos;s</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">1. Spieler definieren</CardTitle>
                <CardDescription>
                  Erstelle eine Liste mit Spielern – kopiere sie einfach aus einer Nachricht oder
                  tippe sie ein.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">2. Link teilen</CardTitle>
                <CardDescription>
                  Teile den Link zu deiner Spielerliste mit Freunden – sie können dann ihre
                  eigene Aufstellung erstellen.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">3. Drag & Drop</CardTitle>
                <CardDescription>
                  Ziehe Spieler auf das Feld und positioniere sie frei – funktioniert auf Desktop
                  und Handy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">4. Vergleichen</CardTitle>
                <CardDescription>
                  Sieh dir die Aufstellungen deiner Freunde an und diskutiert, wer die beste Elf
                  zusammengestellt hat.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-primary/5">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold mb-4">Bereit für deine Traumelf?</h2>
              <p className="text-muted-foreground mb-6">
                Keine Registrierung nötig zum Mitmachen. Erstelle ein Konto, um eigene Listen zu
                verwalten.
              </p>
              <Link href="/dashboard">
                <Button size="lg">Kostenlos starten</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Aufstellungsmaker. Mit Liebe zum Fußball gebaut.</p>
        </div>
      </footer>
    </div>
  );
}

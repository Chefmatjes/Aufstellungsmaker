import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Share2, 
  Smartphone, 
  Sparkles, 
  MousePointer2, 
  MessageSquare, 
  Globe, 
  ClipboardPaste,
  CheckCircle2,
  Image as ImageIcon
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b">
        <div className="absolute inset-0 football-field opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Aufstellungsmaker</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Anmelden</Button>
              </Link>
              <Link href="/dashboard">
                <Button className="shadow-lg shadow-primary/20 font-medium">Loslegen</Button>
              </Link>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto text-center py-20 lg:py-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Neu: WhatsApp Bild-Export & Öffentliche Listen</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1]">
              Deine <span className="text-primary relative">Traumelf<span className="absolute -bottom-2 left-0 w-full h-2 bg-primary/20 -rotate-1" /></span> <br className="hidden md:block" /> in wenigen Sekunden
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Erstelle taktische Formationen per Drag & Drop und teile sie sofort. 
              <span className="font-semibold text-foreground"> Ohne Anmeldung</span> – direkt im Browser.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-10 h-14 shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                  Jetzt kostenlos starten
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-10 h-14 bg-background/50 backdrop-blur-sm">
                  Live Demo
                </Button>
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground grayscale opacity-60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Kein Abo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Mobil optimiert</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Datenschutzfreundlich</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Philosophy / Simplicity Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Kern-Philosophie: Einfachheit</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wir hassen komplizierte Formulare genauso wie du. Der Aufstellungsmaker ist darauf ausgelegt, Barrieren abzubauen.
            </p>
            <ul className="space-y-4">
              {[
                { icon: Smartphone, title: "Keine Anmeldung nötig", text: "Nutzer können sofort loslegen, Aufstellungen erstellen und teilen." },
                { icon: Share2, title: "Teilen per Link oder Bild", text: "Die Ergebnisse können sofort via WhatsApp oder Social Media verbreitet werden." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
            <div className="relative bg-card border rounded-2xl shadow-2xl p-4 overflow-hidden">
               <div className="aspect-[4/3] football-field rounded-lg opacity-40 flex items-center justify-center">
                  <MousePointer2 className="w-12 h-12 text-white/50 animate-bounce" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Mächtige Funktionen</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Alles was du brauchst, um deine Fußball-Ideen zu visualisieren.
          </p>
        </div>
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: ClipboardPaste,
              title: "Spieler-Listen (Vorgaben)",
              description: "Importiere Namen per Copy & Paste. Automatische Gruppierung in Tor, Abwehr, Mittelfeld und Sturm.",
            },
            {
              icon: MousePointer2,
              title: "Lineup-Editor (Drag & Drop)",
              description: "Verschiebe Spieler frei auf dem Feld. Die Marker passen sich farblich automatisch der Position an.",
            },
            {
              icon: ImageIcon,
              title: "WhatsApp Bild-Export",
              description: "Generiere ein hochwertiges PNG deiner Aufstellung und teile es mit einem Klick direkt in deine Gruppe.",
            },
            {
              icon: Globe,
              title: "Öffentliche Listen",
              description: "Gib deine Listen für die Community frei, damit jeder seine eigene Version davon erstellen kann.",
            },
            {
              icon: CheckCircle2,
              title: "Validierung & Logik",
              description: "Der Editor prüft die Vollständigkeit (11 Spieler) und verhindert versehentliche Duplikate.",
            },
            {
              icon: MessageSquare,
              title: "Diskutieren & Vergleichen",
              description: "Sende deinen Link an Freunde, damit diese ihre eigene Traumelf dagegenstellen können.",
            }
          ].map((feature, i) => (
            <Card key={i} className="group hover:border-primary/50 transition-colors shadow-sm">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute -inset-10 bg-primary/10 rounded-[4rem] blur-3xl opacity-50" />
            <div className="relative bg-card border shadow-2xl rounded-3xl p-10 md:p-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Bereit für deine Traumelf?</h2>
              <p className="text-xl text-muted-foreground mb-10">
                Erstelle jetzt deine erste Liste oder nutze eine der öffentlichen Vorlagen. 
                <br className="hidden md:block" />
                Völlig kostenlos und ohne Verpflichtungen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-12 h-14 font-bold shadow-lg shadow-primary/20">
                    Kostenlos starten
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="text-lg px-12 h-14">
                    Konto erstellen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-lg">Aufstellungsmaker</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 Aufstellungsmaker. Mit Liebe zum Fußball gebaut.
          </p>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/demo" className="hover:text-foreground">Demo</Link>
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/login" className="hover:text-foreground">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


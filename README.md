# Aufstellungsmaker

Eine Web-App zum Erstellen und Teilen von Fußball-Aufstellungen per Drag & Drop.

## Features

- **Spielerlisten erstellen**: Importiere Spielernamen per Copy & Paste mit automatischer Kategorie-Erkennung (Tor, Abwehr, Mittelfeld, Sturm)
- **Drag & Drop Editor**: Positioniere Spieler frei auf einem interaktiven Fußballfeld
- **Mobile-optimiert**: Touch-Unterstützung für Smartphones und Tablets
- **Teilen**: Generiere Links zum Teilen von Listen und Aufstellungen
- **Authentication**: Anmeldung mit Google oder Apple

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Deployment**: Vercel (empfohlen)

## Getting Started

### 1. Repository klonen

```bash
git clone <repo-url>
cd aufstellungsmaker
npm install
```

### 2. Supabase einrichten

1. Erstelle ein Projekt auf [supabase.com](https://supabase.com)
2. Führe das SQL-Schema aus: `supabase/schema.sql`
3. Konfiguriere OAuth-Provider (Google/Apple) unter Authentication → Providers
4. Siehe `supabase/README.md` für Details

### 3. Umgebungsvariablen

Erstelle eine `.env.local` Datei:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Startet den Entwicklungsserver auf http://localhost:3000 |
| `npm run build` | Erstellt einen optimierten Production Build |
| `npm run start` | Startet den Production Server (nach `npm run build`) |
| `npm run lint` | Führt ESLint aus |

### Prozesse stoppen (PowerShell)

```powershell
# Alle Node-Prozesse stoppen
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Oder spezifisch den Port 3000 freigeben
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Prozesse stoppen (Bash/Linux/Mac)

```bash
# Alle Node-Prozesse stoppen
pkill -f node

# Oder spezifisch den Port 3000 freigeben
lsof -ti:3000 | xargs kill -9
```

## Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # OAuth Callback Handler
│   ├── dashboard/         # Benutzer-Dashboard
│   ├── demo/              # Demo-Seite ohne Anmeldung
│   ├── lineup/[slug]/     # Aufstellungs-Ansicht
│   ├── list/              # Spielerlisten
│   │   ├── [slug]/        # Listen-Detail & Editor
│   │   └── new/           # Neue Liste erstellen
│   ├── login/             # Login-Seite
│   └── profile/           # Profil-Seite
├── components/            # React-Komponenten
│   ├── ui/               # Shadcn UI Komponenten
│   ├── football-field.tsx # Drag & Drop Spielfeld
│   ├── player-pool.tsx   # Spielerauswahl
│   └── ...
└── lib/                   # Utilities
    ├── supabase/         # Supabase Client
    ├── auth.ts           # Auth Helpers
    ├── database.types.ts # TypeScript Types
    └── parse-players.ts  # Text-Parser für Spielerlisten
```

## Deployment

### Vercel (empfohlen)

1. Pushe das Repository zu GitHub
2. Importiere das Projekt in [Vercel](https://vercel.com)
3. Füge die Umgebungsvariablen hinzu
4. Deploy!

### Supabase Redirect URLs

Vergiss nicht, die Production-URL zu den erlaubten Redirect URLs in Supabase hinzuzufügen:

```
https://your-domain.vercel.app/auth/callback
```

## Lizenz

MIT

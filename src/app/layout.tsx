import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aufstellungsmaker - Fußball-Aufstellungen erstellen & teilen",
  description:
    "Erstelle deine Traumelf per Drag & Drop und teile sie mit Freunden. Perfekt für WM, EM oder die beste Vereinself aller Zeiten.",
  keywords: ["Fußball", "Aufstellung", "Lineup", "Drag and Drop", "Nationalmannschaft"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

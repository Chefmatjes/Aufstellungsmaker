export interface ParsedPlayer {
  name: string;
  category: string | null;
}

export interface ParseResult {
  players: ParsedPlayer[];
  categories: string[];
}

/**
 * Parse a text input containing player names, optionally with category headers.
 * 
 * Supported formats:
 * 1. Simple list (one name per line):
 *    Manuel Neuer
 *    Joshua Kimmich
 *    Thomas Müller
 * 
 * 2. With category headers:
 *    Tor
 *    Manuel Neuer
 *    Oliver Kahn
 *    
 *    Abwehr
 *    Philipp Lahm
 *    Mats Hummels
 * 
 * 3. With category prefixes:
 *    Tor: Manuel Neuer
 *    Abwehr: Philipp Lahm
 */
export function parsePlayersText(text: string): ParseResult {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const players: ParsedPlayer[] = [];
  const categories = new Set<string>();
  let currentCategory: string | null = null;

  // Known category keywords (German)
  const categoryKeywords = [
    "tor",
    "torwart",
    "torhüter",
    "keeper",
    "abwehr",
    "verteidigung",
    "verteidiger",
    "defense",
    "mittelfeld",
    "mittelfeldspieler",
    "midfield",
    "sturm",
    "stürmer",
    "angriff",
    "offense",
    "forward",
    "attack",
    "trainer",
    "coach",
    "lehrer",
    "übungsleiter",
  ];

  for (const line of lines) {
    // Check if line is a category header (single word that matches known categories)
    const normalizedLine = line.toLowerCase().replace(/[:\-–]/g, "").trim();
    
    // Check for category with colon format: "Tor: Manuel Neuer"
    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch) {
      const potentialCategory = colonMatch[1].trim();
      const playerName = colonMatch[2].trim();
      
      if (categoryKeywords.some((k) => potentialCategory.toLowerCase().includes(k))) {
        currentCategory = potentialCategory;
        categories.add(currentCategory);
        players.push({ name: playerName, category: currentCategory });
        continue;
      }
    }

    // Check if it's a standalone category header
    if (categoryKeywords.some((k) => normalizedLine === k || normalizedLine.includes(k))) {
      // It's likely a category header
      currentCategory = line.replace(/[:\-–]/g, "").trim();
      categories.add(currentCategory);
      continue;
    }

    // Otherwise, it's a player name
    // Clean up common prefixes like "- " or "• "
    const cleanedName = line
      .replace(/^[-•*]\s*/, "")
      .replace(/^\d+\.\s*/, "")
      .trim();

    if (cleanedName.length > 0) {
      players.push({
        name: cleanedName,
        category: currentCategory,
      });
    }
  }

  return {
    players,
    categories: Array.from(categories),
  };
}

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  // Add random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${randomSuffix}`;
}

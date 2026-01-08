"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Share2, Loader2, Image as ImageIcon } from "lucide-react";

interface ShareScreenshotButtonProps {
  teamName: string;
}

export function ShareScreenshotButton({ teamName }: ShareScreenshotButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    const fieldElement = document.getElementById("football-field");
    if (!fieldElement) return;

    setIsGenerating(true);
    try {
      // Small delay to ensure any UI states are settled
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(fieldElement, {
        cacheBust: true,
        backgroundColor: "#15803d", // Match green field color for screenshot
        style: {
          borderRadius: "0", // Remove border radius for clean screenshot
        },
      });

      // Convert data URL to Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `aufstellung-${teamName.toLowerCase().replace(/\s+/g, "-")}.png`, {
        type: "image/png",
      });

      // Check if Web Share API is available and supports files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Meine Aufstellung: ${teamName}`,
          text: `Schau dir meine Aufstellung "${teamName}" auf Aufstellungsmaker an!`,
        });
      } else {
        // Fallback: Download the image if sharing is not supported
        const link = document.createElement("a");
        link.download = `aufstellung-${teamName}.png`;
        link.href = dataUrl;
        link.click();
        alert("Sharing wird von deinem Browser nicht unterstützt. Das Bild wurde stattdessen heruntergeladen.");
      }
    } catch (err) {
      console.error("Error generating screenshot:", err);
      alert("Fehler beim Erstellen des Screenshots.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleShare}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Bild wird erstellt...
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 mr-2" />
          Aufstellung teilen (Bild)
        </>
      )}
    </Button>
  );
}

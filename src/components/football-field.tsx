"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface PlayerPosition {
  id: string;
  candidateId: string;
  name: string;
  xPercent: number;
  yPercent: number;
  category?: string | null;
}

interface FootballFieldProps {
  players: PlayerPosition[];
  onPlayerMove?: (playerId: string, xPercent: number, yPercent: number) => void;
  onPlayerEndMove?: (playerId: string, xPercent: number, yPercent: number) => void;
  onPlayerRemove?: (playerId: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function FootballField({
  players,
  onPlayerMove,
  onPlayerEndMove,
  onPlayerRemove,
  readOnly = false,
  className,
}: FootballFieldProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; playerX: number; playerY: number } | null>(null);

  const getPositionFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!fieldRef.current || !dragStartPos.current) return null;

      const rect = fieldRef.current.getBoundingClientRect();
      
      // Calculate the delta from drag start
      const deltaX = clientX - dragStartPos.current.x;
      const deltaY = clientY - dragStartPos.current.y;
      
      // Convert delta to percentage
      const deltaXPercent = (deltaX / rect.width) * 100;
      const deltaYPercent = (deltaY / rect.height) * 100;
      
      // New position is start position + delta
      const xPercent = Math.max(5, Math.min(95, dragStartPos.current.playerX + deltaXPercent));
      const yPercent = Math.max(5, Math.min(readOnly ? 95 : 100, dragStartPos.current.playerY + deltaYPercent));

      return { xPercent, yPercent };
    },
    [readOnly]
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, playerId: string) => {
      if (readOnly) return;

      e.preventDefault();
      e.stopPropagation();
      
      const player = players.find((p) => p.id === playerId);
      if (!player) return;

      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      dragStartPos.current = {
        x: clientX,
        y: clientY,
        playerX: player.xPercent,
        playerY: player.yPercent,
      };
      
      setDraggingId(playerId);
    },
    [players, readOnly]
  );

  // Handle drag move and end with useEffect
  useEffect(() => {
    if (!draggingId) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      
      let clientX: number, clientY: number;
      if ("touches" in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const position = getPositionFromEvent(clientX, clientY);
      if (position && onPlayerMove) {
        onPlayerMove(draggingId, position.xPercent, position.yPercent);
      }
    };

    const handleEnd = () => {
      if (draggingId && onPlayerEndMove) {
        // We need the current position. Since draggingId is just an ID, 
        // we can't easily get it here without tracking it or searching players.
        // But players state is current here.
        const player = players.find(p => p.id === draggingId);
        if (player) {
          onPlayerEndMove(draggingId, player.xPercent, player.yPercent);
        }
      }
      setDraggingId(null);
      dragStartPos.current = null;
    };

    // Add listeners
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [draggingId, getPositionFromEvent, onPlayerMove, onPlayerEndMove, players]);

  // Get category color
  const getCategoryColor = (category?: string | null) => {
    if (!category) return "bg-primary";
    const cat = category.toLowerCase();
    if (cat.includes("tor")) return "bg-amber-500";
    if (cat.includes("abwehr") || cat.includes("verteidigung")) return "bg-blue-500";
    if (cat.includes("mittelfeld")) return "bg-emerald-500";
    if (cat.includes("sturm") || cat.includes("angriff")) return "bg-rose-500";
    return "bg-primary";
  };

  return (
    <div
      ref={fieldRef}
      id="football-field"
      className={cn(
        "relative w-full aspect-[68/105] football-field rounded-lg overflow-hidden select-none",
        className
      )}
      style={{ touchAction: "none" }}
    >
      {/* Field markings */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 68 105"
        preserveAspectRatio="none"
      >
        {/* Outer border */}
        <rect
          x="2"
          y="2"
          width="64"
          height="101"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Center line */}
        <line
          x1="2"
          y1="52.5"
          x2="66"
          y2="52.5"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Center circle */}
        <circle
          cx="34"
          cy="52.5"
          r="9.15"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Center spot */}
        <circle cx="34" cy="52.5" r="0.5" fill="var(--field-lines)" opacity="0.8" />

        {/* Top penalty area */}
        <rect
          x="13.85"
          y="2"
          width="40.3"
          height="16.5"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Top goal area */}
        <rect
          x="24.85"
          y="2"
          width="18.3"
          height="5.5"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Top penalty spot */}
        <circle cx="34" cy="13" r="0.5" fill="var(--field-lines)" opacity="0.8" />

        {/* Top penalty arc */}
        <path
          d="M 25.05 18.5 A 9.15 9.15 0 0 0 42.95 18.5"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Bottom penalty area */}
        <rect
          x="13.85"
          y="86.5"
          width="40.3"
          height="16.5"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Bottom goal area */}
        <rect
          x="24.85"
          y="97"
          width="18.3"
          height="5.5"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Bottom penalty spot */}
        <circle cx="34" cy="92" r="0.5" fill="var(--field-lines)" opacity="0.8" />

        {/* Bottom penalty arc */}
        <path
          d="M 25.05 86.5 A 9.15 9.15 0 0 1 42.95 86.5"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />

        {/* Corner arcs */}
        <path
          d="M 2 3 A 1 1 0 0 0 3 2"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />
        <path
          d="M 65 2 A 1 1 0 0 0 66 3"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />
        <path
          d="M 66 102 A 1 1 0 0 0 65 103"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />
        <path
          d="M 3 103 A 1 1 0 0 0 2 102"
          fill="none"
          stroke="var(--field-lines)"
          strokeWidth="0.3"
          opacity="0.8"
        />
      </svg>

      {/* Players */}
      {players.map((player) => (
        <div
          key={player.id}
          className={cn(
            "absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 z-10",
            !readOnly && "cursor-grab",
            draggingId === player.id && "z-20 cursor-grabbing"
          )}
          style={{
            left: `${player.xPercent}%`,
            top: `${player.yPercent}%`,
          }}
          onMouseDown={(e) => handleDragStart(e, player.id)}
          onTouchStart={(e) => handleDragStart(e, player.id)}
        >
          <div
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/50 transition-transform",
              getCategoryColor(player.category),
              draggingId === player.id && "scale-110 shadow-2xl"
            )}
          >
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="mt-1 px-2 py-0.5 bg-black/70 rounded text-white text-xs whitespace-nowrap max-w-[80px] sm:max-w-[100px] truncate">
            {player.name.split(" ").pop()}
          </div>
          {!readOnly && onPlayerRemove && (
            <button
              className="absolute -top-1 -right-1 w-6 h-6 bg-destructive hover:bg-destructive/80 text-white rounded-full text-sm font-bold flex items-center justify-center shadow-md transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onPlayerRemove(player.id);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onPlayerRemove(player.id);
              }}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {/* Drop hint when field is empty */}
      {players.length === 0 && !readOnly && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-center p-4">
            <p className="text-lg font-medium">Ziehe Spieler hierher</p>
            <p className="text-sm">oder klicke auf einen Spieler in der Liste</p>
          </div>
        </div>
      )}
    </div>
  );
}

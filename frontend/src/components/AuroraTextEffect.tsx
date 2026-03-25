import React from "react";
import { cn } from "../lib/utils";

export interface AuroraTextEffectProps {
  text: string;
  className?: string;
  textClassName?: string;
  fontSize?: string;
}

export function AuroraTextEffect({
  text,
  className,
  textClassName,
  fontSize = "inherit",
}: AuroraTextEffectProps) {
  
  // The keyframes now intentionally bring each color to the exact center (50% 50%) 
  // one by one, while pushing the others outside the text bounds (-20% or 120%).
  const keyframes = `
    @property --x-1 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
    @property --y-1 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
    @property --x-2 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }
    @property --y-2 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
    @property --x-3 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
    @property --y-3 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }
    @property --x-4 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }
    @property --y-4 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }

    @keyframes move-aurora-takeover {
      0% {
        --x-1: 50%; --y-1: 50%;   /* Cyan floods the text */
        --x-2: 120%; --y-2: -20%;
        --x-3: -20%; --y-3: 120%;
        --x-4: 120%; --y-4: 120%;
      }
      25% {
        --x-1: -20%; --y-1: -20%;
        --x-2: 50%; --y-2: 50%;   /* Orange floods the text */
        --x-3: 120%; --y-3: 120%;
        --x-4: -20%; --y-4: 120%;
      }
      50% {
        --x-1: 120%; --y-1: 120%;
        --x-2: -20%; --y-2: 120%;
        --x-3: 50%; --y-3: 50%;   /* Green floods the text */
        --x-4: -20%; --y-4: -20%;
      }
      75% {
        --x-1: -20%; --y-1: 120%;
        --x-2: 120%; --y-2: 120%;
        --x-3: -20%; --y-3: -20%;
        --x-4: 50%; --y-4: 50%;   /* Purple floods the text */
      }
      100% {
        --x-1: 50%; --y-1: 50%;   /* Cyan floods the text again */
        --x-2: 120%; --y-2: -20%;
        --x-3: -20%; --y-3: 120%;
        --x-4: 120%; --y-4: 120%;
      }
    }

    .animate-aurora-text {
      /* 8 seconds keeps the transitions fast and fluid. Alternate keeps the random bouncing feel */
      animation: move-aurora-takeover 8s ease-in-out infinite alternate;
    }
  `;

  return (
    <span className={cn("inline-flex items-center justify-center overflow-visible px-1", className)}>
      <style>{keyframes}</style>
      <span
        className={cn(
          "relative z-10 inline-block py-1",
          "text-transparent bg-clip-text transform-gpu will-change-[background-position] animate-aurora-text",
          textClassName
        )}
        style={{
          fontSize,
          /* Scaled down slightly to 125% so the outer colors fade nicely while the center color dominates */
          backgroundImage: `
            radial-gradient(125% 125% at var(--x-1) var(--y-1), #22d3ee 0%, transparent 100%),
            radial-gradient(125% 125% at var(--x-2) var(--y-2), #fb923c 0%, transparent 100%),
            radial-gradient(125% 125% at var(--x-3) var(--y-3), #4ade80 0%, transparent 100%),
            radial-gradient(125% 125% at var(--x-4) var(--y-4), #a855f7 0%, transparent 100%)
          `,
        }}
      >
        {text}
      </span>
    </span>
  );
}
import React from "react";
import { cn } from "@/lib/utils";

interface AuroraTextEffectProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  className?: string;     
  textClassName?: string; 
  as?: React.ElementType;
}

export function AuroraTextEffect({
  text,
  className,
  textClassName,
  as: Component = "span",
  ...props
}: AuroraTextEffectProps) {
  return (
    <Component
      className={cn(
        "relative inline-flex justify-center overflow-visible", 
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "relative z-10 block select-none py-2",
          
          // 1. RENDERING FIXES
          // 'text-transparent bg-clip-text' is required for the effect.
          // We removed 'antialiased' to let the browser decide the best smoothing.
          // Added 'transform-gpu' + 'backface-hidden' to fix jagged edges during animation.
          "text-transparent bg-clip-text transform-gpu backface-hidden will-change-[background-position]",
          
          // 2. BASE COLOR + SPOTLIGHTS
          // Base: Black/White
          // Spots: Small (8%) and fading out quickly (25%) to keep text legible.
          "[--base-color:#000000] dark:[--base-color:#FFFFFF]",
          "bg-[image:radial-gradient(circle_farthest-side_at_var(--x-1)_var(--y-1),#4300FF_8%,transparent_25%),radial-gradient(circle_farthest-side_at_var(--x-2)_var(--y-2),#ff073a_8%,transparent_25%),radial-gradient(circle_farthest-side_at_var(--x-3)_var(--y-3),#4300FF_8%,transparent_25%),radial-gradient(circle_farthest-side_at_var(--x-4)_var(--y-4),#ff073a_8%,transparent_25%),linear-gradient(var(--base-color),var(--base-color))]",
          
          // 3. ANIMATION TRIGGER
          "animate-aurora-chaos",
          
          textClassName
        )}
      >
        {text}
      </span>
      
      <style>{`
        @property --x-1 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
        @property --y-1 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
        @property --x-2 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }
        @property --y-2 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
        @property --x-3 { syntax: '<percentage>'; inherits: false; initial-value: 0%; }
        @property --y-3 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }
        @property --x-4 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }
        @property --y-4 { syntax: '<percentage>'; inherits: false; initial-value: 100%; }

        /* NEW KEYFRAMES: EXTREME DIRECTIONS 
           We use corners (0%, 100%) to force full-range movement.
        */

        /* Path 1: Top-Left to Bottom-Right (Diagonal Down) */
        @keyframes move-1 {
          0% { --x-1: 0%; --y-1: 0%; }
          50% { --x-1: 100%; --y-1: 100%; }
          100% { --x-1: 0%; --y-1: 0%; }
        }

        /* Path 2: Top-Right to Bottom-Left (Diagonal Up/Down) */
        @keyframes move-2 {
          0% { --x-2: 100%; --y-2: 0%; }
          50% { --x-2: 0%; --y-2: 100%; }
          100% { --x-2: 100%; --y-2: 0%; }
        }

        /* Path 3: Vertical Drop (Top Center -> Bottom Center) */
        @keyframes move-3 {
          0% { --x-3: 50%; --y-3: 0%; }
          50% { --x-3: 50%; --y-3: 100%; }
          100% { --x-3: 50%; --y-3: 0%; }
        }

        /* Path 4: Horizontal Sweep (Left -> Right) to cover all bases */
        @keyframes move-4 {
          0% { --x-4: 0%; --y-4: 50%; }
          50% { --x-4: 100%; --y-4: 50%; }
          100% { --x-4: 0%; --y-4: 50%; }
        }

        .animate-aurora-chaos {
          animation: 
            move-1 8s ease-in-out infinite,
            move-2 12s ease-in-out infinite reverse,
            move-3 10s ease-in-out infinite,
            move-4 15s ease-in-out infinite reverse;
        }
      `}</style>
    </Component>
  );
}
import { forwardRef, useCallback, type ElementType, type HTMLAttributes, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

type SpotlightTone = "sky" | "amber" | "neutral";
type SpotlightIntensity = "subtle" | "regular" | "strong";

interface SpotlightCardProps extends HTMLAttributes<HTMLElement> {
  /** HSL triplet (e.g. "201 90% 60%"). Overrides `tone`. */
  spotlightColor?: string;
  /** Radius of the spotlight in px. */
  spotlightSize?: number;
  /** Preset spotlight color. */
  tone?: SpotlightTone;
  /** Glow strength + backdrop density. */
  intensity?: SpotlightIntensity;
  /** Adds subtle veil under content to guarantee text contrast. */
  readability?: boolean;
  /** Enables hover-lift + spotlight reveal. */
  interactive?: boolean;
  as?: ElementType;
}

const TONE_VAR: Record<SpotlightTone, string> = {
  sky: "var(--spotlight-color)",
  amber: "var(--spot-color-amber)",
  neutral: "var(--spot-color-neutral)",
};

const INTENSITY: Record<SpotlightIntensity, { bg: string; blur: string; glow: string }> = {
  subtle: { bg: "bg-glass-soft", blur: "backdrop-blur-xl", glow: "0.14" },
  regular: { bg: "bg-glass", blur: "backdrop-blur-2xl", glow: "0.22" },
  strong: { bg: "bg-glass-strong", blur: "backdrop-blur-2xl", glow: "0.3" },
};

/**
 * SIGAP Glass Card with cursor-following spotlight glow.
 * Reusable across modules — do not add feature-specific styling here.
 */
const SpotlightCard = forwardRef<HTMLElement, SpotlightCardProps>(
  (
    {
      as: Tag = "div",
      className,
      spotlightColor,
      spotlightSize = 520,
      tone = "sky",
      intensity = "regular",
      readability = true,
      interactive = true,
      children,
      onMouseMove,
      style,
      ...rest
    },
    ref,
  ) => {
    const handleMove = useCallback(
      (e: MouseEvent<HTMLElement>) => {
        if (interactive) {
          const el = e.currentTarget;
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
          el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
        }
        onMouseMove?.(e);
      },
      [onMouseMove, interactive],
    );

    const spotColor = spotlightColor ?? TONE_VAR[tone];
    const cfg = INTENSITY[intensity];

    return (
      <Tag
        ref={ref}
        onMouseMove={handleMove}
        style={
          {
            ...style,
            "--spot-size": `${spotlightSize}px`,
            "--spot-color": spotColor,
            "--spot-max": cfg.glow,
          } as React.CSSProperties
        }
        className={cn(
          "group/spotlight relative isolate overflow-hidden rounded-2xl border border-glass",
          cfg.bg,
          cfg.blur,
          "shadow-glass shadow-glass-inset",
          "ring-1 ring-inset ring-glass-highlight",
          "bg-glass-sheen",
          interactive && "transition-all duration-300",
          className,
        )}
        {...rest}
      >
        {/* Spotlight glow layer */}
        {interactive && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-[1] opacity-0 transition-opacity duration-500 group-hover/spotlight:opacity-100"
            style={{
              background:
                "radial-gradient(var(--spot-size) circle at var(--spot-x, 50%) var(--spot-y, 50%), hsl(var(--spot-color) / var(--spot-max)), transparent 60%)",
            }}
          />
        )}

        {/* Readability veil — subtle, keeps text legible on glass + glow */}
        {readability && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-[1]"
            style={{
              background:
                "linear-gradient(180deg, hsl(var(--glass-content-veil) / 0) 0%, hsl(var(--glass-content-veil) / 0.08) 55%, hsl(var(--glass-content-veil) / 0.22) 100%)",
            }}
          />
        )}

        {children}
      </Tag>
    );
  },
);

SpotlightCard.displayName = "SpotlightCard";

export default SpotlightCard;

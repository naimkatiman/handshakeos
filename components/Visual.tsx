import type { CSSProperties } from "react";

export type VisualName = "brand" | "conversation" | "capture" | "evidence" | "partnership" | "launch" | "network" | "outcomes" | "proof";

/** Decorative artwork always accompanies a visible text label. */
export function Visual({ name, size = 64, className = "" }: { name: VisualName; size?: number; className?: string }) {
  return (
    // Original, local SVGs retain their gradients without image optimization.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/visuals/${name}.svg`}
      alt=""
      aria-hidden="true"
      data-visual={name}
      width={name === "proof" ? Math.round(size * 4 / 3) : size}
      height={size}
      className={`visual ${className}`}
      style={{ "--visual-size": `${size}px` } as CSSProperties}
      draggable={false}
      decoding="async"
    />
  );
}

export function BrandMark({ size = 36 }: { size?: number }) {
  return <Visual name="brand" size={size} className="visual--brand" />;
}

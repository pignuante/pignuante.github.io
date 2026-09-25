import { type ReactElement } from "react";
import { type ProjectThumbnail } from "../types";

export type ProjectThumbnailSlotVariant = "card" | "hero" | "wide";

interface ProjectThumbnailSlotProps {
  thumbnail: ProjectThumbnail;
  variant?: ProjectThumbnailSlotVariant;
}

const THUMBNAIL_SLOT_VARIANTS: Record<
  ProjectThumbnailSlotVariant,
  {
    className: string;
  }
> = {
  card: {
    className: "aspect-[16/9]",
  },
  hero: {
    className: "aspect-[16/8] sm:aspect-[16/7]",
  },
  // A card that spans both columns of the md grid; single-column below md,
  // so it keeps the card ratio there.
  wide: {
    className: "aspect-[16/9] md:aspect-[16/7]",
  },
};

export function ProjectThumbnailSlot({
  thumbnail,
  variant = "card",
}: ProjectThumbnailSlotProps): ReactElement {
  const slotVariant = THUMBNAIL_SLOT_VARIANTS[variant];

  return (
    <figure
      className={`relative overflow-hidden rounded-[var(--pixel-border-radius)] border border-[var(--border-default)] bg-[var(--surface)] ${slotVariant.className}`}
    >
      {thumbnail.src ? (
        <img
          alt={thumbnail.alt}
          className="h-full w-full object-cover"
          loading="lazy"
          src={thumbnail.src}
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--surface-elevated),transparent_65%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_45%,var(--surface-elevated)_45%,var(--surface-elevated)_55%,transparent_55%,transparent_100%)] opacity-70" />
          <figcaption
            className="absolute bottom-2 left-2 rounded-[var(--pixel-border-radius)] border border-[var(--border-default)] bg-[var(--surface-elevated)] px-2 py-1 font-pixel-small text-[12px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {thumbnail.caption}
          </figcaption>
        </>
      )}
    </figure>
  );
}

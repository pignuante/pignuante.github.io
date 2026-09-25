import { type ReactElement } from "react";

interface ProjectDetailSectionProps {
  body: string;
  heading: string;
  headingId: string;
}

export function ProjectDetailSection({
  body,
  heading,
  headingId,
}: ProjectDetailSectionProps): ReactElement {
  return (
    <section aria-labelledby={headingId} className="pixel-dialog p-5 sm:p-6">
      <h2 className="font-pixel text-[16px]" id={headingId}>
        <span aria-hidden="true">▶ </span>
        {heading}
      </h2>
      <p
        className="mt-3 font-pixel-body text-[15px] leading-[1.7]"
        style={{ color: "var(--text-secondary)" }}
      >
        {body}
      </p>
    </section>
  );
}

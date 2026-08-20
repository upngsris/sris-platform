import { TextLink } from "@/components/ui/text-link";

import type { HomeIntroData } from "@/sanity/lib/types";

type Props = {
  data?: HomeIntroData["about"];
};




export function AboutIntro({ data }: Props) {
  const eyebrow =
    data?.eyebrow ?? "About SRIS";

  const heading =
    data?.heading ??
    "Learning doesn't end when the lecture does.";

  const lead =
    data?.lead ??
    "SRIS creates room for students to move from understanding concepts to actually using them.";

  const body =
    data?.body ??
    "Research. Laboratory practicals. Student projects. Peer teaching. New skills. Different disciplines working together.";

  return (
    <section className="intro section">
      <div className="shell">
        <div className="introGrid">
          <div>
            <p className="eyebrow blue">{eyebrow}</p>

            <h2>{heading}</h2>
          </div>

          <div className="introText">
            <p className="lead">{lead}</p>

            <p className="body muted">{body}</p>

            <TextLink href="/about">
              Discover why SRIS exists
            </TextLink>
          </div>
        </div>

        {/* Keep statistics code-owned for now */}
        <div className="stats">
          <div>
            <strong>6</strong>
            <p>Science disciplines</p>
          </div>

          <div>
            <strong>XX</strong>
            <p>Student projects</p>
          </div>

          <div>
            <strong>XX</strong>
            <p>Members & contributors</p>
          </div>

          <div className="statNote">
            <p className="eyebrow blue">
              One community
            </p>

            <p>
              Built around curiosity, practical learning
              and student initiative.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
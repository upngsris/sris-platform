import Link from "next/link";

import type { AboutData } from "@/sanity/lib/types";

type Props = {
  data?: AboutData;
};

export function AboutIntro({ data }: Props) {
  const heading =
    data?.heading ?? "Learning doesn't end when the lecture does.";

  const lead =
    data?.lead ??
    "SRIS creates room for students to move from understanding concepts to actually using them.";

  const body =
    data?.body ??
    "Research. Laboratory practicals. Student projects. Peer teaching. New skills. Different disciplines working together.";

  /*
   * Statistics are code-owned for now. A stat with a null value is left out
   * rather than shown as a placeholder: fill in the real number to publish it.
   */
  const stats = [
    { value: "6", label: "Science disciplines represented" },
    { value: null, label: "Student research projects" },
    { value: null, label: "Members & contributors" },
  ].filter(
    (stat): stat is { value: string; label: string } => stat.value !== null,
  );

  return (
    <section className="lpi-section lpi-deep">
      <div className="lpi-container">
        <div className="lpi-head">
          <h2>{heading}</h2>

          <p>{lead}</p>

          <p>{body}</p>

          <p>
            Built around curiosity, practical learning and student initiative.
          </p>

          <p>
            <Link href="/about" className="lpi-link">
              Discover why SRIS exists
            </Link>
          </p>
        </div>

        <div className={`lpi-icons is-n${stats.length}`}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="lpi-icon-figure">{stat.value}</div>

              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

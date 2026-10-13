import Link from "next/link";

import { routes } from "@/lib/route";

const signposts = [
  {
    title: "Research projects",
    description:
      "Student-led investigations, field work and laboratory studies across the sciences.",
    href: routes.explore.research.index,
  },
  {
    title: "Projects to join",
    description:
      "Open positions on active student projects, from beginner friendly to field and laboratory work.",
    href: routes.explore.projectsToJoin.index,
  },
  {
    title: "Events & workshops",
    description:
      "Practical sessions, research skills workshops and showcases open to UPNG students.",
    href: routes.community.events.index,
  },
];

export function Signposts() {
  return (
    <section className="lpi-section lpi-cp">
      <div className="lpi-container">
        <div className="lpi-blocks">
          {signposts.map((signpost, index) => (
            <div
              className="lpi-block"
              key={signpost.href}
              data-tone={(["primary", "accent", "support"] as const)[index % 3]}
            >
              <h3>{signpost.title}</h3>

              <p>{signpost.description}</p>

              <p>
                <Link href={signpost.href} className="lpi-link">
                  Learn more
                </Link>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

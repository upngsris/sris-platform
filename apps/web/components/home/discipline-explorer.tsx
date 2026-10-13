import { disciplines } from "@/lib/disciplines";
import { routes } from "@/lib/route";

import { LpiCard } from "./lpi-card";

export function DisciplineExplorer() {
  return (
    <section className="lpi-section lpi-primary">
      <div className="lpi-container">
        <div className="lpi-head">
          <h2>Different fields. Shared curiosity.</h2>

          <p>
            SRIS connects students across the sciences while leaving room for
            interdisciplinary work.
          </p>
        </div>

        <div className="lpi-grid is-n3">
          {disciplines.map((discipline, index) => (
            <LpiCard
              key={discipline.value}
              tone={(["accent", "deep", "interactive"] as const)[index % 3]}
              label="Discipline"
              title={discipline.title}
              badge={{
                primary: String(index + 1).padStart(2, "0"),
              }}
              href={routes.learn.laboratoryPracticalsFor(discipline.value)}
              linkLabel="Explore practicals"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

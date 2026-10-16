import { routes } from "@/lib/route";

import { LpiCard, LpiGrid } from "./lpi-card";

import type { FeaturedLearning } from "@/sanity/lib/types";

type Props = {
  data?: FeaturedLearning[];
};

export function LearnAndDo({ data }: Props) {
  if (!data?.length) {
    return null;
  }

  return (
    <section className="lpi-section lpi-white">
      <div className="lpi-container">
        <div className="lpi-head">
          <h2>Learn something. Then do something with it.</h2>

          <p>
            Skills become meaningful when students can immediately put them to
            work.
          </p>
        </div>

        <LpiGrid count={data.length}>
          {data.map((item) => {
            const isPractical = item._type === "laboratoryPractical";

            return (
              <LpiCard
                key={item._id}
                tone="interactive"
                label={item.kind ?? "Learn & do"}
                title={item.title}
                summary={item.summary}
                image={item.image}
                badge={{ primary: isPractical ? "Lab" : "Learn" }}
                href={
                  isPractical
                    ? routes.learn.laboratoryPractical(item.slug)
                    : routes.learn.detail(item.slug)
                }
                linkLabel={
                  isPractical ? "View practical" : "Explore learning activity"
                }
              />
            );
          })}
        </LpiGrid>
      </div>
    </section>
  );
}

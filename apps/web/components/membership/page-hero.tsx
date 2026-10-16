import { Breadcrumb } from "@/components/ui/breadcrumb";
import { routes } from "@/lib/route";

/** The shared hero for the membership task pages. */
export function MembershipHero({
  current,
  title,
  lead,
}: {
  current: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="pageHero">
      <div className="shell">
        <Breadcrumb
          trail={[
            { label: "Community", href: routes.community.events.index },
            { label: "Membership", href: routes.community.membership },
            { label: current },
          ]}
        />

        <div className="pageHeroGrid">
          <div>
            <p className="eyebrow blue">Membership</p>

            <h1>{title}</h1>
          </div>

          <p className="lead">{lead}</p>
        </div>
      </div>
    </section>
  );
}

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/home/hero";
import { Introduction } from "@/components/home/introduction";
import { Stats } from "@/components/home/stats";
import { FeaturedResearch } from "@/components/home/featured-research";
import { Disciplines } from "@/components/home/disciplines";
import { ProjectsToJoin } from "@/components/home/projects-to-join";
import { LearnAndDo } from "@/components/home/learn-and-do";
import { StudentStory } from "@/components/home/student-story";
import { UpcomingEvents } from "@/components/home/upcoming-events";
import { LatestStories } from "@/components/home/latest-stories";
import { MembershipCta } from "@/components/home/membership-cta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Introduction />
        <Stats />
        <FeaturedResearch />
        <Disciplines />
        <ProjectsToJoin />
        <LearnAndDo />
        <StudentStory />
        <UpcomingEvents />
        <LatestStories />
        <MembershipCta />
      </main>
      <SiteFooter />
    </>
  );
}

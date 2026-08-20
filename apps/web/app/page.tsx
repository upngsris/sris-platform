import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

import { Hero } from "@/components/home/hero";
import { AboutIntro } from "@/components/home/about-intro";
import { FeaturedResearch } from "@/components/home/featured-research";
import { DisciplineExplorer } from "@/components/home/discipline-explorer";
import { ProjectsToJoin } from "@/components/home/projects-to-join";
import { LearnAndDo } from "@/components/home/learn-and-do";
import { StudentStory } from "@/components/home/student-story";
import { Events } from "@/components/home/events";
import { MembershipCTA } from "@/components/home/membership-cta";

import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_INTRO_QUERY } from "@/sanity/lib/queries";

import type { HomeIntroData } from "@/sanity/lib/types";

export default async function Home() {
  const data = await sanityFetch<HomeIntroData>({
    query: HOME_INTRO_QUERY,
  });

  return (
    <>
      <SiteHeader />

      <main>
        <Hero data={data?.hero} />

        <AboutIntro data={data?.about} />

        {/* Still static */}
        <FeaturedResearch data={data?.featuredResearch} />
        <DisciplineExplorer />
        <ProjectsToJoin
          data={data?.featuredOpportunities}
        />
        <LearnAndDo
          data={data?.featuredLearning}
        />
        <StudentStory data={data?.featuredStory} />
        <Events data={data?.featuredEvents} />
        <MembershipCTA data={data?.membershipCta} />
      </main>

      <SiteFooter />
    </>
  );
}
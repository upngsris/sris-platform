import { Hero } from "@/components/home/hero";
import { Signposts } from "@/components/home/signposts";
import { AboutIntro } from "@/components/home/about-intro";
import { FeaturedResearch } from "@/components/home/featured-research";
import { DisciplineExplorer } from "@/components/home/discipline-explorer";
import { ProjectsToJoin } from "@/components/home/projects-to-join";
import { LearnAndDo } from "@/components/home/learn-and-do";
import { StudentStory } from "@/components/home/student-story";
import { Events } from "@/components/home/events";
import { MembershipCta } from "@/components/home/membership-cta";

import { sanityFetch } from "@/sanity/lib/fetch";
import { HOME_PAGE_QUERY } from "@/sanity/lib/queries";

import type { HomePageData } from "@/sanity/lib/types";

import { pageMetadata, site } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "UPNG SRIS | Science, Research & Innovation Society",
  description: site.description,
  path: "/",
});

export default async function Home() {
  const data = await sanityFetch<HomePageData>({
    query: HOME_PAGE_QUERY,
  });

  return (
    <main className="lpi lpi-home">
      <Hero data={data?.hero} />

      <Signposts />

      <MembershipCta data={data?.membershipCta} />

      <StudentStory data={data?.featuredStory} />

      <AboutIntro data={data?.about} />

      <FeaturedResearch data={data?.featuredResearch} />

      <ProjectsToJoin data={data?.featuredOpportunities} />

      <LearnAndDo data={data?.featuredLearning} />

      <Events data={data?.featuredEvents} />

      <DisciplineExplorer />
    </main>
  );
}

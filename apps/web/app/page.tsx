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

export default function Home() {
  return <>
    <SiteHeader />
    <main>
      <Hero />
      <AboutIntro />
      <FeaturedResearch />
      <DisciplineExplorer />
      <ProjectsToJoin />
      <LearnAndDo />
      <StudentStory />
      <Events />
      <MembershipCTA />
    </main>
    <SiteFooter />
  </>;
}

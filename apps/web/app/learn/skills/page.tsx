import type {Metadata} from "next";

import {LearningCategoryPage} from "@/components/learn/learning-category-page";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/route";

export const metadata: Metadata = pageMetadata({
  title: "Skills Track | Learn & Do | UPNG SRIS",
  description:
    "Develop practical scientific, technical and research skills through SRIS Skills Track activities at the University of Papua New Guinea.",
  path: routes.learn.skills,
});

export default function SkillsPage() {
  return (
    <LearningCategoryPage
      kind="Skills Track"
      heading="Build skills you can actually use."
      introduction="Develop practical scientific, technical and research capabilities through activities designed to complement what students learn in formal coursework."
    />
  );
}
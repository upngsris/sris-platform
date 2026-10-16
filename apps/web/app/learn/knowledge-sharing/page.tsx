import type {Metadata} from "next";

import {LearningCategoryPage} from "@/components/learn/learning-category-page";
import { pageMetadata } from "@/lib/seo";
import { routes } from "@/lib/route";

export const metadata: Metadata = pageMetadata({
  title: "Knowledge Sharing | Learn & Do | UPNG SRIS",
  description:
    "Explore peer-led knowledge sharing where students explain concepts, methods and practical experiences through UPNG SRIS.",
  path: routes.learn.knowledgeSharing,
});

export default function KnowledgeSharingPage() {
  return (
    <LearningCategoryPage
      kind="Knowledge Sharing"
      heading="Learn it well enough to explain it."
      introduction="Knowledge sharing gives students room to discuss concepts, demonstrate methods and strengthen their own understanding by helping others learn."
    />
  );
}
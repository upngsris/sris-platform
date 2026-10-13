import type {SchemaTypeDefinition} from "sanity";

import {seo} from "./objects/seo";

import {aboutPage} from "./documents/aboutPage";
import {contactPage} from "./documents/contactPage";
import {contactSubmission} from "./documents/contactSubmission";
import {member} from "./documents/member";
import {membershipPeriod} from "./documents/membershipPeriod";
import {membershipRegistration} from "./documents/membershipRegistration";
import {event} from "./documents/event";
import {homePage} from "./documents/homePage";
import {laboratoryPractical} from "./documents/laboratoryPractical";
import {learningItem} from "./documents/learningItem";
import {newsletterIssue} from "./documents/newsletterIssue";
import {collaborationsPage} from "./documents/collaborationsPage";
import {person} from "./documents/person";
import {projectOpportunity} from "./documents/projectOpportunity";
import {researchProject} from "./documents/researchProject";
import {studentStory} from "./documents/studentStory";
import {teamAssignment} from "./documents/teamAssignment";
import {teamPage} from "./documents/teamPage";

/**
 * Content for the public website. Lives in the public dataset, which anyone
 * can read through Sanity's API, so it must never hold personal data.
 */
export const publicSchemaTypes: SchemaTypeDefinition[] = [
  seo,

  homePage,
  aboutPage,
  contactPage,
  teamPage,
  person,
  teamAssignment,
  researchProject,
  projectOpportunity,
  learningItem,
  laboratoryPractical,
  newsletterIssue,
  collaborationsPage,
  studentStory,
  event,

  membershipPeriod,
]

/**
 * Personal data the website collects. Lives in a separate PRIVATE dataset
 * (see docs/membership.md) that only signed-in project members can read.
 */
export const privateSchemaTypes: SchemaTypeDefinition[] = [
  member,
  membershipRegistration,
  contactSubmission,
]

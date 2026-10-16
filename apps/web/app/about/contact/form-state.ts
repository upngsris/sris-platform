/**
 * Shared shape for the contact form's action state.
 *
 * This lives outside actions.ts on purpose: a "use server" module may only
 * export async functions, so the initial-state constant cannot sit alongside
 * the action itself.
 */
export const CONTACT_TOPICS = [
  "Membership",
  "Joining a project",
  "Collaboration or partnership",
  "Events and workshops",
  "Media or press",
  "General enquiry",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    topic?: string;
    subject?: string;
    message?: string;
  };
  /** Echoed back so a failed submission does not wipe what was typed. */
  values?: {
    name: string;
    email: string;
    topic: string;
    subject: string;
    message: string;
  };
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
};

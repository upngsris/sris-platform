"use client";

import Link from "next/link";
import { useActionState, useId } from "react";

import { submitContactEnquiry } from "@/app/about/contact/actions";
import {
  CONTACT_TOPICS,
  initialContactFormState,
} from "@/app/about/contact/form-state";
import { routes } from "@/lib/route";

import styles from "@/app/about/about.module.css";

/**
 * Progressive enhancement: this is a plain <form> bound to a Server Action, so
 * it still submits with JavaScript unavailable. useActionState only adds the
 * pending and error states on top.
 */
export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactEnquiry,
    initialContactFormState,
  );

  const nameId = useId();
  const emailId = useId();
  const topicId = useId();
  const subjectId = useId();
  const messageId = useId();

  const errors = state.fieldErrors ?? {};
  const values = state.values;

  if (state.status === "success") {
    return (
      <div className={styles.formStatus} role="status">
        <p className="eyebrow blue">Message sent</p>

        <p className={styles.formStatusHeading}>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.status === "error" && state.message && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}

      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label htmlFor={nameId}>Your name</label>

          <input
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            required
            defaultValue={values?.name}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
          />

          {errors.name && (
            <p id={`${nameId}-error`} className={styles.fieldError}>
              {errors.name}
            </p>
          )}
        </div>

        <div className={styles.formField}>
          <label htmlFor={emailId}>Email address</label>

          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={values?.email}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
          />

          {errors.email && (
            <p id={`${emailId}-error`} className={styles.fieldError}>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className={styles.formField}>
        <label htmlFor={topicId}>Topic</label>

        <select
          id={topicId}
          name="topic"
          required
          defaultValue={values?.topic ?? ""}
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? `${topicId}-error` : undefined}
        >
          <option value="" disabled>
            Choose a topic
          </option>

          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>

        {errors.topic && (
          <p id={`${topicId}-error`} className={styles.fieldError}>
            {errors.topic}
          </p>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor={subjectId}>
          Subject <span>(optional)</span>
        </label>

        <input
          id={subjectId}
          name="subject"
          type="text"
          defaultValue={values?.subject}
          aria-invalid={errors.subject ? true : undefined}
          aria-describedby={errors.subject ? `${subjectId}-error` : undefined}
        />

        {errors.subject && (
          <p id={`${subjectId}-error`} className={styles.fieldError}>
            {errors.subject}
          </p>
        )}
      </div>

      <div className={styles.formField}>
        <label htmlFor={messageId}>Message</label>

        <textarea
          id={messageId}
          name="message"
          rows={7}
          required
          defaultValue={values?.message}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${messageId}-error` : undefined}
        />

        {errors.message && (
          <p id={`${messageId}-error`} className={styles.fieldError}>
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot — positioned off-screen and hidden from assistive tech. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="organisation">
          Organisation (leave this field empty)
        </label>

        <input
          id="organisation"
          name="organisation"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className="button" disabled={isPending}>
          <span>{isPending ? "Sending…" : "Send message"}</span>

          <span aria-hidden="true">→</span>
        </button>

        <p className={styles.formNote}>
          We use your name and email address only to reply to this enquiry. See
          our <Link href={routes.privacy}>privacy notice</Link>.
        </p>
      </div>
    </form>
  );
}

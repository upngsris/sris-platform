"use client";

import { useActionState } from "react";

import { renewalLinkAction } from "@/app/community/membership/actions";
import { initialMembershipFormState } from "@/lib/membership/form-state";

import { FormError, Honeypot, SubmitButton, TextField } from "./form-parts";
import styles from "./membership.module.css";

export function RenewalRequestForm() {
  const [state, formAction, pending] = useActionState(
    renewalLinkAction,
    initialMembershipFormState,
  );

  if (state.status === "success") {
    return (
      <p className={`${styles.notice} ${styles.noticeSuccess}`} role="status">
        <strong>Check your email. </strong>
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <FormError message={state.status === "error" ? state.message : undefined} />

      <TextField
        name="email"
        type="email"
        label="The email address you registered with"
        autoComplete="email"
        inputMode="email"
        maxLength={200}
        error={state.fieldErrors?.email}
        defaultValue={state.values?.email}
        hint="We will email you a secure link to your saved details. You will not need to enter them again."
      />

      <Honeypot />

      <div className={styles.actions}>
        <SubmitButton pending={pending} label="Email me a renewal link" pendingLabel="Sending…" />
      </div>
    </form>
  );
}

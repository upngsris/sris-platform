"use client";

import { useActionState } from "react";

import { statusAction } from "@/app/community/membership/actions";
import { initialMembershipFormState } from "@/lib/membership/form-state";

import { FormError, SubmitButton, TextField } from "./form-parts";
import styles from "./membership.module.css";
import { StatusView } from "./receipt";

export function StatusLookup() {
  const [state, formAction, pending] = useActionState(
    statusAction,
    initialMembershipFormState,
  );

  return (
    <div className={styles.stack}>
      <form action={formAction} className={styles.form} noValidate>
        <FormError message={state.status === "error" ? state.message : undefined} />

        <div className={styles.row}>
          <TextField
            name="referenceCode"
            label="Reference code"
            placeholder="SRIS-26-ABCDE"
            maxLength={20}
            defaultValue={state.values?.referenceCode}
          />

          <TextField
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            defaultValue={state.values?.email}
          />
        </div>

        <div className={styles.actions}>
          <SubmitButton pending={pending} label="Check status" pendingLabel="Checking…" />
        </div>
      </form>

      {state.status === "success" && state.statusResult && (
        <StatusView result={state.statusResult} />
      )}
    </div>
  );
}

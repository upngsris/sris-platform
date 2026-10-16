"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  registerAction,
} from "@/app/community/membership/actions";
import { CATEGORIES, formatKina } from "@/lib/membership/categories";
import { initialMembershipFormState } from "@/lib/membership/form-state";
import type { MemberCategory, PaymentMethod } from "@/lib/membership/types";

import {
  CheckboxField,
  FormError,
  Honeypot,
  PaymentFields,
  PaymentInstructions,
  SelectField,
  SubmitButton,
  TextField,
} from "./form-parts";
import styles from "./membership.module.css";
import { ReceiptView } from "./receipt";

type Props = {
  category: MemberCategory;
  fee: number;
  paymentMethods: PaymentMethod[];
  paymentNote?: string;
  termsHref: string;
};

export function RegistrationForm({
  category,
  fee,
  paymentMethods,
  paymentNote,
  termsHref,
}: Props) {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialMembershipFormState,
  );

  const definition = CATEGORIES[category];
  const errors = state.fieldErrors ?? {};
  const values = state.values;

  if (state.status === "success" && state.receipt) {
    return <ReceiptView receipt={state.receipt} />;
  }

  if (state.status === "success") {
    // Only a bot reaches this: it was told nothing useful.
    return <p role="status">Thank you.</p>;
  }

  return (
    <form action={formAction} className={styles.form} noValidate>
      <FormError message={state.status === "error" ? state.message : undefined} />

      <input type="hidden" name="category" value={category} />

      <div className={styles.feeBox}>
        <span className={styles.feeAmount}>{formatKina(fee)}</span>

        <span className={styles.feeNote}>
          {definition.label} membership fee for the academic year
        </span>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Your details</legend>

        <div className={styles.row}>
          <TextField
            name="firstName"
            label="First name"
            autoComplete="given-name"
            maxLength={60}
            error={errors.firstName}
            defaultValue={values?.firstName}
          />

          <TextField
            name="lastName"
            label="Last name"
            autoComplete="family-name"
            maxLength={60}
            error={errors.lastName}
            defaultValue={values?.lastName}
          />
        </div>

        <TextField
          name="email"
          type="email"
          label={definition.emailLabel}
          autoComplete="email"
          inputMode="email"
          maxLength={200}
          error={errors.email}
          hint="We use this to confirm your membership and for renewals."
          defaultValue={values?.email}
        />

        {definition.fields.map((field) =>
          field.kind === "select" ? (
            <SelectField
              key={field.name}
              name={field.name}
              label={field.label}
              options={field.options ?? []}
              error={errors[field.name]}
              defaultValue={values?.[field.name]}
            />
          ) : (
            <TextField
              key={field.name}
              name={field.name}
              label={field.label}
              inputMode={field.kind === "year" ? "numeric" : "text"}
              maxLength={field.kind === "year" ? 4 : 100}
              error={errors[field.name]}
              defaultValue={values?.[field.name]}
            />
          ),
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>How to pay</legend>

        <PaymentInstructions methods={paymentMethods} note={paymentNote} fee={fee} />
      </fieldset>

      <PaymentFields methods={paymentMethods} fee={fee} errors={errors} values={values} />

      <Honeypot />

      <CheckboxField name="terms" error={errors.terms}>
        I have read and accept the{" "}
        <Link href={termsHref} target="_blank" rel="noopener" className={styles.link}>
          membership terms and conditions
        </Link>
        .
      </CheckboxField>

      <p className={styles.hint}>
        After you submit, your registration is <strong>pending approval for up
        to 24 hours</strong> while the executives check your payment.
      </p>

      <div className={styles.actions}>
        <SubmitButton
          pending={pending}
          label="Submit registration"
          pendingLabel="Submitting…"
        />
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";

import { renewalSubmitAction } from "@/app/community/membership/actions";
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

type Retained = { label: string; value: string };

type Props = {
  token: string;
  category: MemberCategory;
  fee: number;
  /** Saved details shown as they are and carried over unchanged. */
  retained: Retained[];
  /** Current values of the fields this member may update. */
  editable: Record<string, string>;
  paymentMethods: PaymentMethod[];
  paymentNote?: string;
  termsHref: string;
};

export function RenewalForm({
  token,
  category,
  fee,
  retained,
  editable,
  paymentMethods,
  paymentNote,
  termsHref,
}: Props) {
  const [state, formAction, pending] = useActionState(
    renewalSubmitAction,
    initialMembershipFormState,
  );

  const definition = CATEGORIES[category];
  const errors = state.fieldErrors ?? {};
  const values = state.values;

  if (state.status === "success" && state.receipt) {
    return <ReceiptView receipt={state.receipt} />;
  }

  const editableFields = definition.fields.filter((field) =>
    definition.renewalEditable.includes(field.name),
  );

  return (
    <form action={formAction} className={styles.form} noValidate>
      <FormError message={state.status === "error" ? state.message : undefined} />

      <input type="hidden" name="token" value={token} />

      <div className={styles.feeBox}>
        <span className={styles.feeAmount}>{formatKina(fee)}</span>

        <span className={styles.feeNote}>
          {definition.label} renewal fee for the academic year
        </span>
      </div>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Your saved details</legend>

        <dl className={styles.dl}>
          {retained.map((item) => (
            <div key={item.label} style={{ display: "contents" }}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.hint}>
          These are carried over from your last registration.
          {editableFields.length === 0 &&
            " To change any of them, contact the society's executives."}
        </p>
      </fieldset>

      {editableFields.length > 0 && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Update your details</legend>

          {editableFields.map((field) =>
            field.kind === "select" ? (
              <SelectField
                key={field.name}
                name={field.name}
                label={field.label}
                options={field.options ?? []}
                error={errors[field.name]}
                defaultValue={values?.[field.name] ?? editable[field.name]}
              />
            ) : (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                error={errors[field.name]}
                defaultValue={values?.[field.name] ?? editable[field.name]}
              />
            ),
          )}
        </fieldset>
      )}

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
        After you submit, your renewal is <strong>pending approval for up to 24
        hours</strong> while the executives check your payment.
      </p>

      <div className={styles.actions}>
        <SubmitButton pending={pending} label="Submit renewal" pendingLabel="Submitting…" />
      </div>
    </form>
  );
}

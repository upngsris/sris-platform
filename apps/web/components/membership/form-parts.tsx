"use client";

import { useId, useRef, useState } from "react";

import { formatKina } from "@/lib/membership/categories";
import { MAX_PROOF_BYTES, PROOF_ACCEPT, PROOF_HINT } from "@/lib/membership/proof";
import type { PaymentMethod } from "@/lib/membership/types";

import styles from "./membership.module.css";

type Common = {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  defaultValue?: string;
};

export function TextField({
  name,
  label,
  required = true,
  error,
  hint,
  defaultValue,
  type = "text",
  autoComplete,
  inputMode,
  maxLength = 100,
  placeholder,
}: Common & {
  type?: "text" | "email" | "date" | "number";
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "email";
  maxLength?: number;
  placeholder?: string;
}) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
      />

      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}

      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

export function SelectField({
  name,
  label,
  options,
  required = true,
  error,
  hint,
  defaultValue,
}: Common & { options: readonly string[] }) {
  const id = useId();
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <span className={styles.required} aria-hidden="true"> *</span>}
      </label>

      <select
        id={id}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
      >
        <option value="" disabled>
          Choose…
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {hint && <p id={`${id}-hint`} className={styles.hint}>{hint}</p>}

      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

const megabytes = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

/**
 * Optional file upload. The browser checks type and size straight away so a
 * wrong file is caught before a slow upload; the server repeats every check
 * and is the one that decides.
 */
export function FileField({
  name,
  label,
  hint,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [chosen, setChosen] = useState<{ name: string; size: number } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const shownError = problem ?? error;

  const describedBy = [shownError && `${id}-error`, `${id}-hint`, chosen && `${id}-chosen`]
    .filter(Boolean)
    .join(" ");

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setProblem(null);
    setChosen(null);

    if (!file) {
      return;
    }

    const allowed = /\.(pdf|jpe?g|png|webp)$/i.test(file.name);

    if (!allowed) {
      setProblem("Please choose a PDF, JPG, PNG or WebP file.");
      event.target.value = "";

      return;
    }

    if (file.size > MAX_PROOF_BYTES) {
      setProblem(`That file is ${megabytes(file.size)}. Please choose one under 4 MB.`);
      event.target.value = "";

      return;
    }

    setChosen({ name: file.name, size: file.size });
  }

  function clear() {
    if (input.current) {
      input.current.value = "";
    }

    setChosen(null);
    setProblem(null);
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>

      <input
        ref={input}
        id={id}
        name={name}
        type="file"
        accept={PROOF_ACCEPT}
        onChange={onChange}
        aria-invalid={shownError ? true : undefined}
        aria-describedby={describedBy}
      />

      <p id={`${id}-hint`} className={styles.hint}>
        {hint}
      </p>

      {chosen && (
        <p id={`${id}-chosen`} className={styles.fileChosen}>
          <span>
            Selected: <strong>{chosen.name}</strong> ({megabytes(chosen.size)})
          </span>

          <button type="button" className={styles.linkButton} onClick={clear}>
            Remove
          </button>
        </p>
      )}

      <p id={`${id}-error`} className={styles.error} role="alert" hidden={!shownError}>
        {shownError}
      </p>
    </div>
  );
}

export function CheckboxField({
  name,
  children,
  error,
}: {
  name: string;
  children: React.ReactNode;
  error?: string;
}) {
  const id = useId();

  return (
    <div className={styles.field}>
      <div className={styles.check}>
        <input
          id={id}
          name={name}
          type="checkbox"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        <label htmlFor={id} className={styles.checkLabel}>
          {children}
        </label>
      </div>

      {error && <p id={`${id}-error`} className={styles.error}>{error}</p>}
    </div>
  );
}

/** Real visitors never see or fill this; scripts that fill every field do. */
export function Honeypot() {
  return (
    <div className={styles.trap} aria-hidden="true">
      <label>
        Organisation
        <input type="text" name="organisation" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
      <strong>Error: </strong>
      {message}
    </p>
  );
}

export function SubmitButton({
  pending,
  label,
  pendingLabel,
}: {
  pending: boolean;
  label: string;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      className="button"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

/** How to pay, shown above the payment fields. */
export function PaymentInstructions({
  methods,
  note,
  fee,
}: {
  methods: readonly PaymentMethod[];
  note?: string;
  fee: number;
}) {
  return (
    <div className={styles.stack}>
      <p>
        Pay the membership fee of <strong>{formatKina(fee)}</strong> using one
        of the methods below, then enter the receipt or transaction details
        under <em>Your payment</em>. Do not enter card numbers or passwords
        anywhere on this form.
      </p>

      <ul className={styles.accounts}>
        {methods.map((method) => (
          <li key={method._key} className={styles.account}>
            <h3>{method.label}</h3>

            <dl className={`${styles.dl} ${styles.accountDl}`}>
              {method.accountName && (
                <>
                  <dt>Account name</dt>
                  <dd>{method.accountName}</dd>
                </>
              )}

              {method.accountNumber && (
                <>
                  <dt>Account / number</dt>
                  <dd>{method.accountNumber}</dd>
                </>
              )}
            </dl>

            {method.instructions && (
              <div className={styles.howTo}>
                <p className={styles.howToLabel}>How to pay</p>

                <p className={styles.howToText}>{method.instructions}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {note && <p>{note}</p>}
    </div>
  );
}

/** The payment details the member enters after paying. */
export function PaymentFields({
  methods,
  fee,
  errors,
  values,
}: {
  methods: readonly PaymentMethod[];
  fee: number;
  errors: Record<string, string>;
  values?: Record<string, string>;
}) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Your payment</legend>

      <div className={styles.row}>
        <SelectField
          name="paymentMethod"
          label="How did you pay?"
          options={methods.map((method) => method.label)}
          error={errors.paymentMethod}
          defaultValue={values?.paymentMethod}
        />

        <TextField
          name="amountPaid"
          label="Amount paid (kina)"
          inputMode="decimal"
          maxLength={8}
          error={errors.amountPaid}
          hint={`The fee is ${formatKina(fee)}.`}
          defaultValue={values?.amountPaid ?? String(fee)}
        />
      </div>

      <div className={styles.row}>
        <TextField
          name="paymentReference"
          label="Receipt or transaction number"
          maxLength={60}
          error={errors.paymentReference}
          hint="From your bank or mobile-money receipt."
          defaultValue={values?.paymentReference}
        />

        <TextField
          name="paidOn"
          label="Date paid"
          type="date"
          error={errors.paidOn}
          defaultValue={values?.paidOn}
        />
      </div>

      <TextField
        name="payerName"
        label="Name on the payment"
        required={false}
        error={errors.payerName}
        hint="Only if it is different from your own name."
        defaultValue={values?.payerName}
      />

      <FileField
        name="proof"
        label="Proof of payment (optional)"
        error={errors.proof}
        hint={`${PROOF_HINT} A photo, screenshot or PDF of your receipt helps the executives approve you faster. Make sure it does not show card numbers or PINs.`}
      />
    </fieldset>
  );
}

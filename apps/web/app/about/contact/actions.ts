"use server";

import { headers } from "next/headers";

import { SRIS_TIME_ZONE } from "@/lib/dates";
import {
  emailConfig,
  emailConfigured,
  escapeHtml,
  senderConfig,
  sendEmail,
  singleLine,
} from "@/lib/email";
import { rateLimited } from "@/lib/rate-limit";
import { privateClient, privateStoreReady } from "@/sanity/lib/private-client";

import { CONTACT_TOPICS, type ContactFormState } from "./form-state";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Best-effort client address, used only as a rate-limit key. */
async function clientKey() {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

function readField(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function submitContactEnquiry(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = readField(formData, "name");
  const email = readField(formData, "email");
  const topic = readField(formData, "topic");
  const subject = readField(formData, "subject");
  const message = readField(formData, "message");

  // Honeypot: hidden from people, irresistible to bots. Report success so the
  // bot has nothing to learn, but write nothing.
  if (readField(formData, "organisation")) {
    return {
      status: "success",
      message: "Thank you — your message has been sent.",
    };
  }

  const values = { name, email, topic, subject, message };

  const fieldErrors: ContactFormState["fieldErrors"] = {};

  if (name.length < 2 || name.length > 100) {
    fieldErrors.name = "Please enter your full name.";
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 200) {
    fieldErrors.email =
      "Please enter an email address we can reply to.";
  }

  if (!(CONTACT_TOPICS as readonly string[]).includes(topic)) {
    fieldErrors.topic = "Please choose what your message is about.";
  }

  if (subject.length > 140) {
    fieldErrors.subject =
      "Please keep the subject under 140 characters.";
  }

  if (message.length < 10) {
    fieldErrors.message =
      "Please tell us a little more — at least 10 characters.";
  }

  if (message.length > 2000) {
    fieldErrors.message =
      "Please keep your message under 2000 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  // Five messages per ten minutes per client is far more than a real person
  // sends, and it stops a script flooding the inbox.
  if (rateLimited(await clientKey(), { limit: 5, windowMs: 10 * 60 * 1000 })) {
    return {
      status: "error",
      message:
        "You have sent several messages recently. Please wait a few minutes and try again, or email SRIS directly.",
      values,
    };
  }

  // Enquiries hold personal details, so they go only to the private dataset.
  const canStore = await privateStoreReady();
  const canEmail = emailConfigured();

  if (!canStore && !canEmail) {
    return {
      status: "error",
      message:
        "The enquiry form is not connected yet. Please email SRIS directly and we will respond.",
      values,
    };
  }

  const submittedAt = new Date().toISOString();

  // Saved to Sanity first: that copy is the record, and it still exists if
  // the email provider is down.
  let stored = false;

  if (canStore) {
    try {
      await privateClient.create({
        _type: "contactSubmission",
        name,
        email,
        topic,
        subject: subject || undefined,
        message,
        submittedAt,
        status: "new",
      });

      stored = true;
    } catch (error) {
      console.error("[contact] Could not store the enquiry in Sanity:", error);
    }
  }

  // Then the team is told. A failure here is logged, not shown to the
  // visitor, because their message has already been kept.
  let notified = false;

  const config = emailConfig();

  if (config) {
    const when = new Intl.DateTimeFormat("en-AU", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: SRIS_TIME_ZONE,
    }).format(new Date(submittedAt));

    const heading = singleLine(subject || `${topic} enquiry`);

    notified = await sendEmail({
      to: config.to,
      replyTo: email,
      subject: singleLine(`[SRIS website] [${topic}] ${heading} — ${name}`),
      text: [
        "New message from the SRIS website contact form.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Topic: ${topic}`,
        `Subject: ${subject || "(none)"}`,
        `Received: ${when}`,
        "",
        message,
        "",
        "Reply to this email to answer them directly.",
      ].join("\n"),
      html: `
        <p>New message from the SRIS website contact form.</p>
        <table cellpadding="6" style="border-collapse:collapse">
          <tr><td><strong>Name</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          <tr><td><strong>Topic</strong></td><td>${escapeHtml(topic)}</td></tr>
          <tr><td><strong>Subject</strong></td><td>${escapeHtml(subject || "(none)")}</td></tr>
          <tr><td><strong>Received</strong></td><td>${escapeHtml(when)}</td></tr>
        </table>
        <p style="white-space:pre-wrap;border-left:4px solid #18789e;padding-left:12px">${escapeHtml(message)}</p>
        <p style="color:#595959">Reply to this email to answer them directly.</p>`,
    });
  }

  // Receipt for the sender. Best effort: their message is already kept, and
  // the form never reports a failure for a missing receipt.
  if (senderConfig()) {
    const firstName = singleLine(name).split(" ")[0];

    await sendEmail({
      to: [email],
      replyTo: config?.to[0],
      subject: "We received your message — SRIS",
      text: [
        `Hello ${firstName},`,
        "",
        "Thank you for contacting the Science, Research and Innovation Society (SRIS) at the University of Papua New Guinea. We have received your message and the team will reply to this email address, usually within a few days during the academic year.",
        "",
        `Topic: ${topic}`,
        subject ? `Subject: ${subject}` : "",
        "",
        "Your message:",
        message,
        "",
        "If you did not send this message, you can ignore this email.",
      ].join("\n"),
      html: `
        <p>Hello ${escapeHtml(firstName)},</p>
        <p>Thank you for contacting the Science, Research and Innovation Society (SRIS) at the University of Papua New Guinea. We have received your message and the team will reply to this email address, usually within a few days during the academic year.</p>
        <p><strong>Topic:</strong> ${escapeHtml(topic)}${subject ? `<br><strong>Subject:</strong> ${escapeHtml(subject)}` : ""}</p>
        <p style="white-space:pre-wrap;border-left:4px solid #18789e;padding-left:12px">${escapeHtml(message)}</p>
        <p style="color:#595959">If you did not send this message, you can ignore this email.</p>`,
    });
  }

  // Success means the message reached at least one place a person will look.
  if (!stored && !notified) {
    return {
      status: "error",
      message:
        "Something went wrong sending your message. Please try again, or email SRIS directly.",
      values,
    };
  }

  return {
    status: "success",
    message:
      "Thank you — your message has been sent. SRIS will respond to your email address.",
  };
}

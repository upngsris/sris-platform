"use client";

import {useId, useRef, useState} from "react";

import styles from "@/app/about/team/team.module.css";

export type CertificateEntry = {
  key: string;
  /** e.g. "President · 2025" */
  title: string;
  url: string;
  mimeType?: string;
};

/**
 * A trigger plus a view-only certificate window on the same page.
 *
 * "View-only" is a deterrent, not protection: the PDF viewer's toolbar is
 * hidden and images cannot be dragged or right-clicked, but anything a
 * browser can display, a determined visitor can save.
 */
export function CertificateViewer({
  certificates,
  startIndex = 0,
  label,
}: {
  certificates: CertificateEntry[];
  startIndex?: number;
  label: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Several viewers can share a page (hero and each history row).
  const titleId = useId();

  const [index, setIndex] = useState<number | null>(null);

  if (certificates.length === 0) {
    return null;
  }

  const isOpen = index !== null;
  const activeIndex = index ?? startIndex;
  const certificate = certificates[activeIndex];

  const isImage =
    certificate?.mimeType?.startsWith("image/") ?? false;

  function open() {
    setIndex(startIndex);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function step(offset: number) {
    setIndex((current) =>
      current === null
        ? current
        : (current + offset + certificates.length) %
          certificates.length,
    );
  }

  return (
    <>
      <button
        type="button"
        className={`button ${styles.certificateTrigger}`}
        aria-haspopup="dialog"
        onClick={open}
      >
        <span>{label}</span>
        <span aria-hidden="true">↗</span>
      </button>

      <dialog
        ref={dialogRef}
        className={styles.certificateDialog}
        // Images size the window to themselves; a PDF viewer has no
        // intrinsic size, so it gets a fixed-height window.
        data-kind={isImage ? "image" : "pdf"}
        aria-labelledby={titleId}
        // The file is only mounted while open, so closing unloads it.
        onClose={() => setIndex(null)}
        // A click on the backdrop lands on the dialog element itself.
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
      >
        {certificate && (
          // The header is always mounted so showModal() has the close
          // button to focus.
          <div className={styles.certificateFrame}>
            <header className={styles.certificateHeader}>
              <div>
                <p className="eyebrow blue">
                  Leadership certificate
                  {certificates.length > 1 &&
                    ` · ${activeIndex + 1} of ${certificates.length}`}
                </p>

                <h2 id={titleId}>
                  {certificate.title}
                </h2>
              </div>

              <div className={styles.certificateControls}>
                {certificates.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous certificate"
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next certificate"
                    >
                      →
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={close}
                  aria-label="Close certificate"
                  autoFocus
                >
                  ✕
                </button>
              </div>
            </header>

            <div
              className={styles.certificateBody}
              onContextMenu={(event) => event.preventDefault()}
            >
              {!isOpen ? null : isImage ? (
                // A plain <img>: the file is a Sanity file asset, not an
                // image asset, so it has no image pipeline to optimise it.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={certificate.key}
                  src={certificate.url}
                  alt={`Leadership certificate: ${certificate.title}`}
                  draggable={false}
                />
              ) : (
                <iframe
                  key={certificate.key}
                  src={`${certificate.url}#toolbar=0&navpanes=0&view=Fit`}
                  title={`Leadership certificate: ${certificate.title}`}
                />
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

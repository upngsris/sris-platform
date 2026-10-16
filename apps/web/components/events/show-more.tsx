"use client";

import { Children, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** How many items show before the button is pressed. */
  initial: number;
  className?: string;
  buttonClassName?: string;
  label?: string;
};

/**
 * Shows the first `initial` items of a grid and reveals the rest on request.
 *
 * Items passed here should not carry `data-reveal`: the global reveal
 * observer only collects elements on navigation, so items mounted later
 * would stay hidden.
 */
export function ShowMore({
  children,
  initial,
  className,
  buttonClassName,
  label = "See more events",
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const items = Children.toArray(children);
  const visible = expanded ? items : items.slice(0, initial);

  return (
    <>
      <div className={className}>{visible}</div>

      {!expanded && items.length > initial && (
        <button
          type="button"
          className={buttonClassName}
          onClick={() => setExpanded(true)}
        >
          {label}
        </button>
      )}
    </>
  );
}

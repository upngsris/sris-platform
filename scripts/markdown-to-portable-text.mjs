/**
 * Converts the Markdown editors used to type into plain `text` fields into
 * Portable Text blocks.
 *
 * This exists because the `summary` field offered no hierarchy, so authors
 * reached for `**bold**`, `###` and `*` bullets — which the site printed
 * literally. It handles exactly the syntax that appears in the dataset;
 * anything else is passed through as body text rather than guessed at.
 */

let keySeed = 0;

/** Deterministic keys keep repeated runs from producing spurious diffs. */
function key(prefix) {
  keySeed += 1;
  return `${prefix}${keySeed.toString(36).padStart(4, "0")}`;
}

export function resetKeys() {
  keySeed = 0;
}

/** Splits a line into spans, marking `**bold**` runs as `strong`. */
function toSpans(text) {
  const spans = [];
  const pattern = /\*\*(.+?)\*\*/g;

  let cursor = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      spans.push({
        _type: "span",
        _key: key("s"),
        text: text.slice(cursor, match.index),
        marks: [],
      });
    }

    spans.push({
      _type: "span",
      _key: key("s"),
      text: match[1],
      marks: ["strong"],
    });

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    spans.push({
      _type: "span",
      _key: key("s"),
      text: text.slice(cursor),
      marks: [],
    });
  }

  /* An empty line still needs one span or the block renders as nothing. */
  if (spans.length === 0) {
    spans.push({_type: "span", _key: key("s"), text, marks: []});
  }

  return spans;
}

function block(style, text, listItem, level) {
  const value = {
    _type: "block",
    _key: key("b"),
    style,
    markDefs: [],
    children: toSpans(text),
  };

  if (listItem) {
    value.listItem = listItem;
    value.level = level ?? 1;
  }

  return value;
}

export function markdownToPortableText(source) {
  if (!source || !source.trim()) {
    return [];
  }

  const blocks = [];

  /* Paragraphs are separated by blank lines; a soft break inside one is just
     a space once the text reflows in the browser. */
  const paragraphs = source
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const paragraph of paragraphs) {
    const lines = paragraph
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let pending = [];

    const flush = () => {
      if (pending.length > 0) {
        blocks.push(block("normal", pending.join(" ")));
        pending = [];
      }
    };

    for (const line of lines) {
      const heading = /^(#{1,6})\s+(.*)$/.exec(line);

      if (heading) {
        flush();
        /* `#` and `##` become h2; anything deeper becomes h3. The schema
           offers no h4+, and an event programme has no use for one. */
        blocks.push(
          block(heading[1].length <= 2 ? "h2" : "h3", heading[2].trim()),
        );
        continue;
      }

      const bullet = /^[*-]\s+(.*)$/.exec(line);

      if (bullet) {
        flush();
        blocks.push(block("normal", bullet[1].trim(), "bullet", 1));
        continue;
      }

      const numbered = /^\d+[.)]\s+(.*)$/.exec(line);

      if (numbered) {
        flush();
        blocks.push(block("normal", numbered[1].trim(), "number", 1));
        continue;
      }

      pending.push(line);
    }

    flush();
  }

  return blocks;
}

/** First body paragraph, flattened, for use as the short plain summary. */
export function deriveSummary(blocks, limit = 240) {
  const first = blocks.find(
    (candidate) => candidate.style === "normal" && !candidate.listItem,
  );

  if (!first) {
    return "";
  }

  const text = first.children
    .map((span) => span.text)
    .join("")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= limit) {
    return text;
  }

  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");

  return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

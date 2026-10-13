/**
 * Where SRIS is, resolved from the society's own Google Maps place link:
 * https://maps.app.goo.gl/JdKCkW2uMhbaUdTD7
 *
 * These are defaults, not the source of truth — the Contact document in Sanity
 * overrides any of them. They exist because that document has not been created
 * yet, and without them the contact page renders a form and nothing else: no
 * address, no map, no way to find the society.
 *
 * Email and phone are deliberately absent. There is no published address
 * anywhere in the project to fall back on, and inventing one would send
 * enquiries into a void or, worse, to a stranger.
 */
export const SRIS_LOCATION = {
  name: "Science 1, University of Papua New Guinea",
  address: "Waigani Campus, Port Moresby, National Capital District",
  latitude: -9.4080789,
  longitude: 147.169029,
  mapUrl: "https://maps.app.goo.gl/JdKCkW2uMhbaUdTD7",
} as const;

type Coordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Embeddable map for a coordinate pair.
 *
 * This uses the keyless `output=embed` endpoint rather than the Maps Embed
 * API, which would need a billing-enabled key committed to the client. If a
 * key is added later, swap the base URL here and nothing else changes.
 */
export function mapEmbedSrc(
  {latitude, longitude}: Coordinates,
  zoom = 17,
) {
  const params = new URLSearchParams({
    q: `${latitude},${longitude}`,
    z: String(zoom),
    hl: "en",
    output: "embed",
  });

  return `https://www.google.com/maps?${params.toString()}`;
}

/** Opens turn-by-turn directions from wherever the visitor is. */
export function mapDirectionsUrl({
  latitude,
  longitude,
}: Coordinates) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${latitude},${longitude}`,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

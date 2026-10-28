// One id shape for every client-generated record: a stable prefix plus enough
// randomness that two devices cannot collide. crypto.randomUUID is available in
// every browser this app targets and in Node 24, so there is no fallback path.
// Nothing parses these ids, so the hex is opaque on purpose.
export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

/**
 * Desktop full-bleed: section background spans the viewport while staying inside the public shell.
 * Mobile: no extra classes (layout unchanged).
 */
export const marketingSectionBleed =
  "md:relative md:w-screen md:max-w-[100vw] md:ml-[calc(50%_-_50vw)]";

/** Narrow column used inside marketing sections (matches previous max-w-6xl wrapper). */
export const marketingSectionInner = "mx-auto max-w-6xl px-4 md:px-6 lg:px-8";

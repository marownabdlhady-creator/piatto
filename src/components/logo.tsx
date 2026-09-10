import Image from "next/image";

/**
 * The wordmark, as the client's own artwork.
 *
 * `unoptimized` because the source is an SVG: Next's optimizer refuses those
 * unless `dangerouslyAllowSVG` is turned on, and there is nothing for it to do
 * to a vector anyway — it is already sharp at every size and on every screen.
 *
 * The intrinsic size is the artwork's own square viewBox. It is there to give
 * the box an aspect ratio so nothing shifts while the file loads; the height
 * that actually applies comes from `className`, with `w-auto` beside it.
 */
export function Logo({
  alt,
  className,
  loading = "lazy",
}: {
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <Image
      src="/piatto-logo.svg"
      alt={alt}
      width={1080}
      height={1080}
      loading={loading}
      unoptimized
      className={className}
    />
  );
}

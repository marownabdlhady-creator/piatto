import Image from "next/image";

/**
 * The wordmark, as the client's own artwork.
 *
 * `unoptimized` because the source is an SVG: Next's optimizer refuses those
 * unless `dangerouslyAllowSVG` is turned on, and there is nothing for it to do
 * to a vector anyway — it is already sharp at every size and on every screen.
 *
 * The intrinsic size is the artwork's own viewBox, which is cropped to the
 * lettering: the file ships on a 1080 square canvas the wordmark only occupies
 * a middle band of, so an uncropped box renders a mark about a fifth of its own
 * height and the logo reads tiny however large the box is set. It is there to
 * give the box an aspect ratio so nothing shifts while the file loads; the
 * height that actually applies comes from `className`, with `w-auto` beside it.
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
      width={804}
      height={246}
      loading={loading}
      unoptimized
      className={className}
    />
  );
}

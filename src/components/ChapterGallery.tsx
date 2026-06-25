import { useEffect, useState } from "react";

const POUR_MS = 700;

function GalleryImage({
  src,
  alt,
  onPick,
}: {
  src: string;
  alt: string;
  onPick: () => void;
}) {
  const [ready, setReady] = useState(false);

  return (
    <button
      type="button"
      onClick={onPick}
      className="chapter-gallery-item mb-3 block w-full overflow-hidden border border-line md:mb-4"
    >
      <span className="relative block aspect-[4/5] w-full bg-paper-dim">
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          onLoad={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-art ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>
    </button>
  );
}

export default function ChapterGallery({
  images,
  title,
  sectionKey,
  onPick,
}: {
  images: string[];
  title: string;
  sectionKey: string;
  onPick: (src: string) => void;
}) {
  const [visible, setVisible] = useState(
    () => !window.matchMedia("(hover: none)").matches
  );

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (!isTouch) {
      setVisible(true);
      return;
    }

    setVisible(false);
    const t = window.setTimeout(() => setVisible(true), POUR_MS);
    return () => clearTimeout(t);
  }, [sectionKey]);

  return (
    <div
      className={`chapter-gallery columns-2 gap-3 transition-opacity duration-300 ease-art md:columns-3 md:gap-4 lg:columns-4 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {images.map((src, i) => (
        <GalleryImage
          key={src}
          src={src}
          alt={`${title} — работа ${i + 1}`}
          onPick={() => onPick(src)}
        />
      ))}
    </div>
  );
}

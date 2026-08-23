import Carousel from "react-bootstrap/Carousel";
import SafeImage from "./SafeImage";
import { CAROUSEL_IMAGE } from "../lib/images";

interface PhotoCarouselProps {
  images: (string | null)[];
  alt: string;
}

export default function PhotoCarousel({ images, alt }: PhotoCarouselProps) {
  // Drop null/empty entries the seed data contains before deciding what to show.
  const usable = images.filter(
    (src): src is string => typeof src === "string" && src.trim() !== ""
  );

  if (usable.length === 0) {
    return (
      <span className="img-frame activity-card-image" role="img" aria-label={`${alt} - no photos available`}>
        <span className="image-fallback">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-4.5-4.5L3 21" />
          </svg>
        </span>
      </span>
    );
  }

  return (
    <Carousel indicators={usable.length > 1} controls={usable.length > 1}>
      {usable.map((src, index) => (
        <Carousel.Item key={`${src}-${index}`}>
          <SafeImage
            className="activity-card-image"
            src={src}
            alt={`${alt} - photo ${index + 1}`}
            sizing={CAROUSEL_IMAGE}
            priority={index === 0}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}

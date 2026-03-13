import React, { useEffect, useRef, useState } from "react";

type InitialLocation = { x: number; y: number };

type Props = {
  onLocationSelect: (x: number, y: number) => void;
  initialLocation?: InitialLocation;
  className?: string;
  // Tailwind height class to control visible map height. Example: 'h-96' or 'h-[60vh]'
  heightClass?: string;
};

type LocationState = {
  x: number; // pixels from left
  y: number; // pixels from top
  xPercent: number; // percentage from left (0-100)
  yPercent: number; // percentage from top (0-100)
};

const CampusMapPicker: React.FC<Props> = ({ onLocationSelect, initialLocation, className = "", heightClass = 'h-96 sm:h-[32rem]' }) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  // try multiple candidate filenames so an uploaded image (e.g. campus-image.png)
  // will be used automatically if present; falls back to the svg placeholder.
  const candidates = ['/campus-image.png', '/campus-map.png', '/campus-map.jpg', '/campus-map.png.jpg', '/campus-map.svg'];
  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = candidates[imgIndex] || '/campus-map.svg';
  const [location, setLocation] = useState<LocationState | null>(null);

  useEffect(() => {
    // If an initial pixel location was provided, wait for image to load to compute percents
    const img = imgRef.current;
    if (!img) return;
    if (initialLocation) {
      const handleLoad = () => {
        const rect = img.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setLocation({
            x: initialLocation.x,
            y: initialLocation.y,
            xPercent: (initialLocation.x / rect.width) * 100,
            yPercent: (initialLocation.y / rect.height) * 100,
          });
        }
      };
      // If already loaded, compute immediately
      if (img.complete && img.naturalWidth) {
        handleLoad();
      } else {
        img.addEventListener("load", handleLoad);
        return () => img.removeEventListener("load", handleLoad);
      }
    }
  }, [initialLocation]);

  const handleClick = (e: React.MouseEvent) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const newLoc: LocationState = { x, y, xPercent, yPercent };
    setLocation(newLoc);
    onLocationSelect(x, y);
  };

  return (
    <div className={`w-full max-w-full ${className}`}>
      <div className={`relative border rounded-lg overflow-hidden bg-white shadow-sm ${heightClass}`}>
        <img
          ref={imgRef}
          src={imgSrc}
          alt="Campus map"
          onClick={handleClick}
          onError={() => {
            // advance to next candidate when an image URL 404s or fails to load
            setImgIndex((i) => Math.min(i + 1, candidates.length - 1));
          }}
          className="w-full h-full object-contain block select-none cursor-crosshair"
          draggable={false}
        />

        {location && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: `${location.xPercent}%`,
              top: `${location.yPercent}%`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-md" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusMapPicker;

import React, { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

type InitialLocation = { x: number; y: number };

type Props = {
  /**
   * Called with the selected location as percentages (0-100)
   * of the image width (x) and height (y). This makes the
   * saved coordinates resolution- and size-independent.
   */
  onLocationSelect: (x: number, y: number) => void;
  /**
   * Optional callback with a detected zone name (or null if none).
   * Zones are computed from the underlying percentage coordinates.
   */
  onZoneSelect?: (zone: string | null) => void;
  initialLocation?: InitialLocation;
  className?: string;
  // Tailwind height class to control visible map height. Example: 'h-96' or 'h-[60vh]'
  heightClass?: string;
};

type LocationState = {
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
};

function detectZone(xPercent: number, yPercent: number): string | null {
  // Simple bounding boxes over the 0–100% coordinate system.
  if (yPercent > 80 && xPercent > 40 && xPercent < 60) return "Main Gate";
  if (yPercent > 40 && yPercent < 60 && xPercent > 45 && xPercent < 55) return "Central Fountain";
  if (yPercent > 30 && yPercent < 70 && xPercent > 20 && xPercent < 80) return "Academic Blocks";
  if (yPercent > 30 && yPercent < 60 && xPercent > 5 && xPercent < 20) return "Library";
  if (yPercent > 30 && yPercent < 70 && xPercent > 80 && xPercent < 100) return "Sports Complex";
  if (yPercent > 70 && xPercent > 10 && xPercent < 40) return "Parking";
  if (yPercent > 70 && xPercent > 60 && xPercent < 90) return "Hostels";
  return null;
}

const CampusMapPicker: React.FC<Props> = ({
  onLocationSelect,
  onZoneSelect,
  initialLocation,
  className = "",
  heightClass = "h-96 sm:h-[32rem]",
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  // try multiple candidate filenames so an uploaded image (e.g. campus-image.png)
  // will be used automatically if present; falls back to the svg placeholder.
  const candidates = ["/campus-image.png", "/campus-map.png", "/campus-map.jpg", "/campus-map.png.jpg", "/campus-map.svg"];
  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = candidates[imgIndex] || "/campus-map.svg";
  const [location, setLocation] = useState<LocationState | null>(null);
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !initialLocation) return;

    const handleLoad = () => {
      setLocation({
        x: initialLocation.x,
        y: initialLocation.y,
      });
      const initialZone = detectZone(initialLocation.x, initialLocation.y);
      setZone(initialZone);
      onZoneSelect?.(initialZone);
    };

    if (img.complete && img.naturalWidth) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
      return () => img.removeEventListener("load", handleLoad);
    }
  }, [initialLocation]);

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;

    // Because we always compute based on the rendered image rect,
    // zooming/panning via react-zoom-pan-pinch is automatically
    // accounted for here.
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.min(100, Math.max(0, x));
    const clampedY = Math.min(100, Math.max(0, y));

    const newLoc: LocationState = { x: clampedX, y: clampedY };
    setLocation(newLoc);
    onLocationSelect(clampedX, clampedY);

    const detected = detectZone(clampedX, clampedY);
    setZone(detected);
    onZoneSelect?.(detected);
  };

  return (
    <div className={`w-full max-w-full ${className}`}>
      <div className={`relative border rounded-lg overflow-hidden bg-white shadow-sm ${heightClass}`}>
        <TransformWrapper
          wheel={{ step: 0.15 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          minScale={1}
          maxScale={4}
          smooth={true}
        >
          <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full">
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
          </TransformComponent>
        </TransformWrapper>

        {location && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: `${location.x}%`,
              top: `${location.y}%`,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
            }}
          >
            <div
              className="rounded-full bg-red-600 border-2 border-white shadow-md"
              style={{
                width: 12,
                height: 12,
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        )}
      </div>

      {zone && (
        <p className="mt-2 text-xs text-gray-600">
          Selected zone: <span className="font-medium">{zone}</span>
        </p>
      )}
    </div>
  );
};

export default CampusMapPicker;

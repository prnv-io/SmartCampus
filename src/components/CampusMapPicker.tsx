import React, { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { getZone } from "@/lib/campusZones";

type InitialLocation = { x: number; y: number };

type Props = {
  /**
   * Called with the selected location as normalized coordinates (0–1)
   * relative to the image's width (x) and height (y).
   */
  onLocationSelect: (x: number, y: number) => void;
  /**
   * Optional callback with a detected zone name (or null if none).
   * Zones are computed from the underlying percentage coordinates.
   */
  onZoneSelect?: (zone: string | null) => void;
  initialLocation?: InitialLocation;
  className?: string;
  // (Deprecated) Avoid fixed heights; they can create blank clickable space.
  // Prefer letting the image determine height (`h-auto`).
  heightClass?: string;
};

type LocationState = {
  x: number; // normalized (0-1) from left
  y: number; // normalized (0-1) from top
};

// Zone detection lives in `src/lib/campusZones.ts` (config + getZone).

const CampusMapPicker: React.FC<Props> = ({
  onLocationSelect,
  onZoneSelect,
  initialLocation,
  className = "",
  heightClass,
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // try multiple candidate filenames so an uploaded image (e.g. campus-image.png)
  // will be used automatically if present; falls back to the svg placeholder.
  const candidates = ["/campus-image.png", "/campus-map.png", "/campus-map.jpg", "/campus-map.png.jpg", "/campus-map.svg"];
  const [imgIndex, setImgIndex] = useState(0);
  const imgSrc = candidates[imgIndex] || "/campus-map.svg";
  const [hoverPosition, setHoverPosition] = useState<LocationState | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<LocationState | null>(null);
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !initialLocation) return;

    const handleLoad = () => {
      const initial: LocationState = {
        x: initialLocation.x,
        y: initialLocation.y,
      };
      setSelectedPosition(initial);
      const initialZone = getZone(initial.x, initial.y);
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

  const computeNormalizedPosition = (
    e: React.MouseEvent<HTMLDivElement>
  ): LocationState | null => {
    const img = imgRef.current;
    if (!img) return null;

    // Always base coordinates on the rendered image bounds so zoom/pan are accounted for.
    const rect = img.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (Number.isNaN(x) || Number.isNaN(y)) return null;
    if (x < 0 || x > 1 || y < 0 || y > 1) return null;
    return { x, y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = computeNormalizedPosition(e);
    if (!pos) return;
    setHoverPosition(pos);
  };

  const handleMouseLeave = () => setHoverPosition(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const pos = computeNormalizedPosition(e);
    if (!pos) return;

    // Debug: should stay consistent across zoom levels
    // eslint-disable-next-line no-console
    console.log("[CampusMapPicker] click normalized", {
      x: Number(pos.x.toFixed(4)),
      y: Number(pos.y.toFixed(4)),
      xPct: Number((pos.x * 100).toFixed(2)),
      yPct: Number((pos.y * 100).toFixed(2)),
      zone: getZone(pos.x, pos.y),
    });

    setSelectedPosition(pos);
    onLocationSelect(pos.x, pos.y);

    const detected = getZone(pos.x, pos.y);
    setZone(detected);
    onZoneSelect?.(detected);
  };

  return (
    <div className={`w-full max-w-full ${className}`}>
      <div
        ref={containerRef}
        className={[
          "relative w-full overflow-hidden rounded-lg border bg-white shadow-sm",
          heightClass ?? "",
        ].join(" ")}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <TransformWrapper
          wheel={{ step: 0.15 }}
          pinch={{ step: 5 }}
          doubleClick={{ disabled: true }}
          minScale={1}
          maxScale={4}
          smooth={true}
        >
          <TransformComponent wrapperClass="w-full" contentClass="w-full">
            <div className="relative w-full">
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Campus map"
                onError={() => {
                  // advance to next candidate when an image URL 404s or fails to load
                  setImgIndex((i) => Math.min(i + 1, candidates.length - 1));
                }}
                className="w-full h-auto block select-none cursor-crosshair"
                draggable={false}
              />

              {hoverPosition && (
                <div
                  aria-hidden
                  className="absolute"
                  style={{
                    left: `${hoverPosition.x * 100}%`,
                    top: `${hoverPosition.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                >
                  <div className="relative" style={{ width: 20, height: 20 }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: 1,
                        backgroundColor: "rgba(239,68,68,0.8)",
                        transform: "translateY(-50%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        bottom: 0,
                        width: 1,
                        backgroundColor: "rgba(239,68,68,0.8)",
                        transform: "translateX(-50%)",
                      }}
                    />
                    <div
                      className="rounded-full bg-red-600 border-2 border-white shadow-md"
                      style={{
                        width: 12,
                        height: 12,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedPosition && (
                <div
                  aria-hidden
                  className="absolute"
                  style={{
                    left: `${selectedPosition.x * 100}%`,
                    top: `${selectedPosition.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 10,
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
          </TransformComponent>
        </TransformWrapper>
      </div>

      {selectedPosition && (
        <p className="mt-2 text-xs text-gray-600">
          Selected zone:{" "}
          <span className="font-medium">
            {zone ?? "Invalid area"}
          </span>
        </p>
      )}
    </div>
  );
};

export default CampusMapPicker;

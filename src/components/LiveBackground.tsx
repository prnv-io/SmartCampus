"use client";

import Particles from "@tsparticles/react";
import { useCallback } from "react";
import { loadSlim } from "tsparticles-slim";

export default function LiveBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: "transparent" },
          particles: {
            number: { value: 35 },
            color: { value: "#ff7a50" },
            opacity: { value: 0.15 },
            size: { value: { min: 2, max: 4 } },
            move: {
              enable: true,
              speed: 0.4,
              outModes: { default: "out" },
            },
            links: {
              enable: true,
              distance: 130,
              color: "#ff7a50",
              opacity: 0.08,
              width: 1,
            },
          },
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab",
              },
            },
            modes: {
              grab: {
                distance: 140,
                links: { opacity: 0.2 },
              },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}

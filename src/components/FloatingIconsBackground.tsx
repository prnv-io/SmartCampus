"use client";

import { Key, Smartphone, Backpack, Wallet, BottleWine } from "lucide-react";
import React, { useMemo } from "react";

const icons = [
  { icon: Key, size: 40 },
  { icon: Smartphone, size: 36 },
  { icon: Backpack, size: 44 },
  { icon: Wallet, size: 38 },
  { icon: BottleWine, size: 34 },
];

export default function FloatingIconsBackground() {
  // Generate random positions for each icon, only once
  const positions = useMemo(() => {
    return icons.map(() => {
      // Ensure icons stay within viewport (5-90%)
      const top = `${5 + Math.random() * 85}%`;
      const left = `${5 + Math.random() * 85}%`;
      return { top, left };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {icons.map(({ icon: Icon, size }, idx) => (
        <Icon
          key={idx}
          size={size}
          className="absolute opacity-10 blur-sm text-gray-400 pointer-events-none"
          style={{
            top: positions[idx].top,
            left: positions[idx].left,
            animation: `float 6s ease-in-out infinite`,
            animationDelay: `${idx * 1.2}s`,
            filter: "blur(2px)",
          }}
        />
      ))}
      {/* CSS keyframes for floating animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-20px) translateX(-10px); }
          75% { transform: translateY(0px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }
      `}</style>
    </div>
  );
}

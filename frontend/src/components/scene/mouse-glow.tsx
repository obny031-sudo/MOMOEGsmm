"use client";

import { useState } from "react";

export default function MouseGlow() {
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });

  return (
    <div
      onMouseMove={(e) =>
        setPos({
          x: e.clientX,
          y: e.clientY,
        })
      }
      className="absolute inset-0 z-[1]"
    >
      <div
        className="pointer-events-none absolute h-[350px] w-[350px] rounded-full bg-indigo-500/15 blur-[120px] transition-all duration-300"
        style={{
          left: pos.x - 175,
          top: pos.y - 175,
        }}
      />
    </div>
  );
}
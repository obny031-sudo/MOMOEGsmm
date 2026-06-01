"use client";

import { motion } from "framer-motion";

export default function Particles() {
  return (
    <>
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -25, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
          }}
          className="absolute rounded-full bg-white/10"
          style={{
            width: 4 + (i % 4),
            height: 4 + (i % 4),
            left: `${(i * 7) + 8}%`,
            top: `${(i * 5) + 10}%`,
          }}
        />
      ))}
    </>
  );
}
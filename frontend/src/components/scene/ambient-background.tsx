"use client";

import { motion } from "framer-motion";

export default function AmbientBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[#05060a]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,.06),transparent_28%)]" />

      <motion.div
        animate={{
          x: [0, 90, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
        }}
        className="absolute -top-52 left-0 h-[700px] w-[700px] rounded-full bg-indigo-500/10 blur-[180px]"
      />

      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
        }}
        className="absolute bottom-0 right-0 h-[650px] w-[650px] rounded-full bg-violet-500/10 blur-[180px]"
      />

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,.45))]" />
    </>
  );
}
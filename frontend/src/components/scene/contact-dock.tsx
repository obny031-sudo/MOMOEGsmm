"use client";

import { motion } from "framer-motion";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

export default function ContactDock() {
  const whatsapp =
    "https://wa.me/201016358741";

  const telegram =
    "https://t.me/o_w_i";

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{
        opacity: 0,
        x: 30,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      className="
        fixed
        right-5
        top-1/2
        z-[999]
        flex
        -translate-y-1/2
        flex-col
        gap-3
      "
    >

      {/* Telegram */}
      <motion.a
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        href={telegram}
        target="_blank"
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-[#0b0c11]/80
          text-sky-400
          backdrop-blur-3xl
          shadow-[0_10px_40px_rgba(0,0,0,.35)]
        "
      >
        <FaTelegramPlane size={24} />
      </motion.a>

      {/* WhatsApp */}
      <motion.a
        whileHover={{
          scale: 1.1,
        }}
        whileTap={{
          scale: 0.95,
        }}
        href={whatsapp}
        target="_blank"
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          border
          border-white/10
          bg-[#0b0c11]/80
          text-emerald-400
          backdrop-blur-3xl
          shadow-[0_10px_40px_rgba(0,0,0,.35)]
        "
      >
        <FaWhatsapp size={24} />
      </motion.a>

    </motion.div>
  );
}
"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function HeroPanel() {
  return (
    <section className="relative z-10 flex min-h-screen items-center px-8 pt-36">

      <div className="mx-auto grid w-full max-w-7xl gap-20 lg:grid-cols-2 items-center">

        {/* LEFT */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: .8,
          }}
        >

          <div className="mb-7">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
              ✦ Elite Product Experience
            </span>
          </div>

          <h1 className="text-7xl font-bold leading-[0.9] tracking-tight">
            Luxury
            <br />
            Product
            <br />
            Experience
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
            Elegant motion, futuristic interaction and premium workflows designed for modern platforms.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <motion.button
              whileHover={{
                y: -5,
                scale: 1.03,
              }}
              className="rounded-3xl bg-white px-7 py-3 font-medium text-black shadow-2xl"
            >
              Launch Platform
            </motion.button>

            <motion.button
              whileHover={{
                y: -5,
              }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] px-7 py-3"
            >
              Explore Demo
            </motion.button>

          </div>

        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{
            opacity: 0,
            scale: .96,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="relative"
        >

          {/* Dashboard */}
          <div className="rounded-[42px] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-3xl shadow-[0_30px_120px_rgba(0,0,0,.55)]">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-zinc-400">
                  Platform Balance
                </p>

                <h2 className="mt-2 text-5xl font-semibold">
                  $
                  <CountUp
                    end={4320}
                    duration={3}
                  />
                </h2>
              </div>

              <div className="rounded-2xl bg-emerald-500/15 px-4 py-2 text-sm text-emerald-300">
                LIVE
              </div>

            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-zinc-400">
                  Orders
                </p>

                <h3 className="mt-3 text-3xl font-semibold">
                  12K+
                </h3>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-sm text-zinc-400">
                  Success
                </p>

                <h3 className="mt-3 text-3xl font-semibold">
                  99%
                </h3>
              </div>

            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-zinc-400">
                Activity
              </p>

              <div className="mt-4 space-y-3">
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[78%] rounded-full bg-indigo-400" />
                </div>

                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[52%] rounded-full bg-violet-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Widget */}
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute -right-6 -top-6 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-2xl shadow-2xl"
          >
            <p className="text-xs text-zinc-400">
              Active Users
            </p>

            <h3 className="mt-1 text-lg font-semibold">
              1,248
            </h3>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
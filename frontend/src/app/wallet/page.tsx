"use client";

import { useState } from "react";

import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";

import {
  Copy,
  Wallet,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Coins,
  CheckCircle2,
} from "lucide-react";

import { motion } from "framer-motion";

export default function WalletPage() {

  const [
    binanceAmount,
    setBinanceAmount
  ] = useState("");

  const [
    vodafoneAmount,
    setVodafoneAmount
  ] = useState("");

  const [
    copied,
    setCopied
  ] = useState("");

  const whatsapp =
    "201016358741";

  const binanceId =
    "BINANCE_ID_HERE";

  const vodafone =
    "01016358741";

  const copy = (
    text:string,
    key:string
  ) => {

    navigator.clipboard.writeText(
      text
    );

    setCopied(
      key
    );

    setTimeout(()=>{
      setCopied("");
    },1800);
  };

  const sendWhatsApp = (
    method:string,
    amount:string
  ) => {

    const msg =
`Hello MOMOEG

Payment Method: ${method}
Amount: ${amount}

Please verify payment.`;

    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060814] text-white">

      <AmbientBackground />
      <FloatingDock />

      {/* Aura */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.12),transparent_25%)]"/>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,.10),transparent_25%)]"/>

      <section className="relative z-10 px-6 pt-32 pb-16">

        <div className="mx-auto max-w-7xl">

          {/* HERO */}

          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-2 text-indigo-300">

                <Sparkles size={16}/>

                Secure Deposit Hub

              </div>

              <h1 className="mt-2 text-5xl font-bold">

                MOMOEG Wallet

              </h1>

              <p className="mt-2 text-zinc-400">

                Premium deposit experience

              </p>

            </div>

            <motion.div
              animate={{
                opacity:[.7,1,.7]
              }}
              transition={{
                repeat:Infinity,
                duration:2
              }}
              className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300"
            >
              Protected Node
            </motion.div>

          </div>

          {/* OVERVIEW */}

          <div className="mb-7 grid gap-4 md:grid-cols-3">

            {[
              {
                title:"Balance",
                value:"$120",
                color:"text-emerald-300"
              },
              {
                title:"Bonus",
                value:"$15",
                color:"text-indigo-300"
              },
              {
                title:"Coupons",
                value:"3",
                color:"text-yellow-300"
              },
            ].map((x,i)=>(

              <motion.div
                key={i}
                whileHover={{
                  y:-3
                }}
                className="rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl"
              >

                <p className="text-sm text-zinc-500">

                  {x.title}

                </p>

                <h2 className={`mt-3 text-4xl font-bold ${x.color}`}>

                  {x.value}

                </h2>

              </motion.div>

            ))}

          </div>

          {/* PAYMENT */}

          <div className="grid gap-6 md:grid-cols-2">

            {[
              {
                title:"Binance",
                id:binanceId,
                amount:binanceAmount,
                set:setBinanceAmount,
                method:"Binance",
              },
              {
                title:"Vodafone Cash",
                id:vodafone,
                amount:vodafoneAmount,
                set:setVodafoneAmount,
                method:"Vodafone Cash",
              },
            ].map((x,i)=>(

              <motion.div
                key={i}
                whileHover={{
                  y:-4
                }}
                className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,.35)]"
              >

                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-emerald-500/[0.03]"/>

                <div className="relative">

                  {/* top */}

                  <div className="flex items-center gap-3">

                    <div className="rounded-2xl bg-indigo-500/10 p-3">

                      <Wallet size={20}/>

                    </div>

                    <h3 className="text-2xl font-semibold">

                      {x.title}

                    </h3>

                  </div>

                  {/* deposit id */}

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">

                    <p className="text-sm text-zinc-500">

                      Payment ID

                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">

                      <span>

                        {x.id}

                      </span>

                      <button
                        onClick={()=>
                          copy(
                            x.id,
                            x.title
                          )
                        }
                        className="rounded-2xl bg-white/10 p-3 transition hover:bg-indigo-500/10"
                      >

                        <Copy size={16}/>

                      </button>

                    </div>

                    {copied===x.title && (

                      <div className="mt-2 text-sm text-emerald-300">

                        Copied ✓

                      </div>

                    )}

                  </div>

                  {/* steps */}

                  <div className="mt-5 rounded-3xl bg-black/20 p-4 text-sm text-zinc-400">

                    <div>1 • Copy payment ID</div>
                    <div className="mt-2">2 • Send payment</div>
                    <div className="mt-2">
                      3 • Confirm via WhatsApp
                    </div>

                  </div>

                  {/* amount */}

                  <input
                    value={x.amount}
                    onChange={(e)=>
                      x.set(
                        e.target.value
                      )
                    }
                    placeholder="Amount"
                    className="mt-5 w-full rounded-3xl border border-white/10 bg-black/20 px-5 py-4 outline-none transition focus:border-emerald-500/30"
                  />

                  {/* confirm */}

                  <button
                    onClick={()=>
                      sendWhatsApp(
                        x.method,
                        x.amount
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-emerald-400 py-4 font-medium text-white shadow-[0_0_30px_rgba(99,102,241,.25)] transition hover:scale-[1.02]"
                  >

                    <MessageCircle
                      size={18}
                    />

                    Confirm via WhatsApp

                  </button>

                </div>

              </motion.div>

            ))}

          </div>

          {/* TRUST */}

          <div className="mt-7 grid gap-4 md:grid-cols-3">

            {[
              "Fast Verify",
              "Secure Route",
              "24/7 Support",
            ].map((x,i)=>(

              <div
                key={i}
                className="rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.05] p-5"
              >

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={16}
                    className="text-emerald-300"
                  />

                  <span className="text-emerald-300">

                    {x}

                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    </main>
  );
}
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import { getServices, ServiceItem } from "@/lib/api/services";
import { createOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import {
  Sparkles,
  Clock3,
  ShieldCheck,
  ChevronDown,
  Search,
  Zap,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

export default function ServicesPage() {
  const router = useRouter();
  const auth = useAuth();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [
    category,
    setCategory
  ] = useState("");

  const [
    selectedId,
    setSelectedId
  ] = useState<number | null>(
    null
  );

  const [
    categoryOpen,
    setCategoryOpen
  ] = useState(false);

  const [
    serviceOpen,
    setServiceOpen
  ] = useState(false);

  const [
    link,
    setLink
  ] = useState("");

  const [
    quantity,
    setQuantity
  ] = useState("");

  const [
    search,
    setSearch
  ] = useState("");

  useEffect(() => {

    async function load() {

      const data =
        await getServices();

      setServices(data);

      if(data.length){

        setCategory(
          data[0].category
        );

        setSelectedId(
          data[0].id
        );

      }

    }

    load();

  },[]);

  const categories =
    useMemo(()=>{

      return [
        ...new Set(
          services.map(
            (s)=>
              s.category
          )
        )
      ];

    },[
      services
    ]);

  const categoryServices =
    useMemo(()=>{

      return services.filter(
        (s)=>
          s.category===
          category &&
          s.title
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    },[
      services,
      category,
      search
    ]);

  const selected =
    categoryServices.find(
      (s)=>
        s.id===
        selectedId
    ) ||
    categoryServices[0];

  const qty =
    Number(quantity)||0;

  const total =
    selected
      ? (
        qty/1000*
        selected.price
      ).toFixed(2)
      : "0";

  const handlePlaceOrder = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!selected) {
      setSubmitError("Select a service");
      return;
    }

    if (!link.trim()) {
      setSubmitError("Enter your target link");
      return;
    }

    if (!qty || qty < selected.min || qty > selected.max) {
      setSubmitError(
        `Quantity must be between ${selected.min} and ${selected.max}`
      );
      return;
    }

    try {
      setSubmitting(true);
      const result = await createOrder({
        serviceId: selected.id,
        link: link.trim(),
        quantity: qty,
      });

      auth.patchUser({ balance: result.balance });
      setSubmitSuccess(result.message || "Order placed successfully");
      setLink("");
      setQuantity("");

      setTimeout(() => {
        router.push("/orders");
      }, 1200);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to place order"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (

    <main className="relative min-h-screen overflow-hidden text-white bg-[#060814]">

      <AmbientBackground/>
      <FloatingDock/>

      {/* aura */}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,.14),transparent_25%)]"/>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,.12),transparent_25%)]"/>

      <section className="relative z-10 px-6 pt-36 pb-16">

        <div className="mx-auto max-w-7xl">

          {/* HERO */}

          <motion.div
            initial={{
              opacity:0,
              y:15
            }}
            animate={{
              opacity:1,
              y:0
            }}
            className="mb-8 overflow-hidden rounded-[42px] border border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.08] to-violet-500/[0.03] p-8 backdrop-blur-3xl"
          >

            <div className="flex flex-wrap items-center justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 text-indigo-200">

                  <Sparkles
                    size={16}
                  />

                  Premium Node

                </div>

                <h1 className="mt-4 text-5xl font-bold">

                  MOMOEG
                  <br/>
                  Elite Order Center

                </h1>

                <p className="mt-3 text-zinc-400">

                  Luxury ordering experience
                  with intelligent routing.

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
                className="rounded-3xl border border-emerald-500/10 bg-emerald-500/10 px-5 py-4 text-emerald-300"
              >
                API Online
              </motion.div>

            </div>

          </motion.div>

          <div className="grid gap-7 lg:grid-cols-[1.15fr_.85fr]">

            {/* LEFT */}

            <div className="space-y-6">

              {/* CATEGORY */}

              <div className="rounded-[40px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">

                <label className="mb-3 block text-sm text-zinc-400">
                  Category
                </label>

                <button
                  onClick={()=>
                    setCategoryOpen(
                      !categoryOpen
                    )
                  }
                  className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-5 py-4"
                >

                  {category}

                  <ChevronDown
                    size={18}
                  />

                </button>

                <AnimatePresence>

                  {categoryOpen && (

                    <motion.div
                      initial={{
                        opacity:0,
                        y:-8
                      }}
                      animate={{
                        opacity:1,
                        y:0
                      }}
                      exit={{
                        opacity:0,
                        y:-8
                      }}
                      className="mt-4 space-y-2 rounded-3xl border border-white/10 bg-[#0c0d12] p-4"
                    >

                      {categories.map(
                        (cat)=>(
                          <button
                            key={cat}
                            onClick={()=>{
                              setCategory(
                                cat
                              );
                              setSelectedId(
                                null
                              );
                              setCategoryOpen(
                                false
                              );
                            }}
                            className="w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-left hover:bg-white/[0.08]"
                          >
                            {cat}
                          </button>
                        )
                      )}

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>

              {/* SERVICE */}

              <div className="rounded-[40px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl">

                <label className="mb-3 block text-sm text-zinc-400">
                  Service
                </label>

                <div className="mb-3 flex items-center gap-3 rounded-3xl border border-white/10 bg-black/20 px-4 py-3">

                  <Search
                    size={16}
                  />

                  <input
                    value={search}
                    onChange={(e)=>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search service..."
                    className="w-full bg-transparent outline-none"
                  />

                </div>

                <button
                  onClick={()=>
                    setServiceOpen(
                      !serviceOpen
                    )
                  }
                  className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-black/20 px-5 py-4"
                >

                  {selected?.title ||
                    "Select Service"}

                  <ChevronDown
                    size={18}
                  />

                </button>

                <AnimatePresence>

                  {serviceOpen && (

                    <motion.div
                      initial={{
                        opacity:0,
                        y:-8
                      }}
                      animate={{
                        opacity:1,
                        y:0
                      }}
                      exit={{
                        opacity:0,
                        y:-8
                      }}
                      className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-3xl border border-white/10 bg-[#0c0d12] p-4"
                    >

                      {categoryServices.map(
                        (
                          service
                        )=>(
                          <button
                            key={
                              service.id
                            }
                            onClick={()=>{
                              setSelectedId(
                                service.id
                              );
                              setServiceOpen(
                                false
                              );
                            }}
                            className="w-full rounded-2xl bg-white/[0.04] px-4 py-3 text-left transition hover:bg-indigo-500/10"
                          >
                            {service.title}
                          </button>
                        )
                      )}

                    </motion.div>

                  )}

                </AnimatePresence>

              </div>

              {/* FORM */}

              <div className="rounded-[40px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-3xl space-y-5">

                <input
                  value={link}
                  onChange={(e)=>
                    setLink(
                      e.target.value
                    )
                  }
                  placeholder="Link"
                  className="w-full rounded-3xl border border-white/10 bg-black/20 px-5 py-4 outline-none"
                />

                <input
                  type="number"
                  value={quantity}
                  onChange={(e)=>
                    setQuantity(
                      e.target.value
                    )
                  }
                  placeholder={`${selected?.min || 0} - ${selected?.max || 0}`}
                  className="w-full rounded-3xl border border-white/10 bg-black/20 px-5 py-4 outline-none"
                />

              </div>

            </div>

            {/* RIGHT */}

            <motion.div
              whileHover={{
                y:-2
              }}
              className="sticky top-28 h-fit rounded-[40px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-3xl"
            >

              <h3 className="text-2xl font-semibold">
                Intelligence Panel
              </h3>

              <div className="mt-6 space-y-4">

                <div className="rounded-3xl bg-black/20 p-4 flex justify-between">

                  <div className="flex items-center gap-2">
                    <Clock3
                      size={16}
                    />
                    ETA
                  </div>

                  {selected?.speed}

                </div>

                <div className="rounded-3xl bg-black/20 p-4 flex justify-between">

                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                    />
                    Price /1000
                  </div>

                  $
                  {selected?.price}

                </div>

                <div className="rounded-3xl bg-black/20 p-4 flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <Zap
                      size={16}
                    />
                    Route
                  </div>

                  Fast Node

                </div>

                <motion.div
                  animate={{
                    scale:[1,1.02,1]
                  }}
                  transition={{
                    repeat:Infinity,
                    duration:2
                  }}
                  className="rounded-3xl border border-emerald-500/10 bg-emerald-500/[0.06] p-5"
                >

                  <p className="text-sm text-zinc-400">
                    Total Charge
                  </p>

                  <h2 className="mt-2 text-4xl font-bold text-emerald-300">

                    $
                    {total}

                  </h2>

                </motion.div>

                {submitError && (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle size={16} />
                    {submitError}
                  </div>
                )}

                {submitSuccess && (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                    <CheckCircle2 size={16} />
                    {submitSuccess}
                  </div>
                )}

                <button
                  type="button"
                  disabled={submitting || !selected}
                  onClick={handlePlaceOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-emerald-400 py-4 font-medium text-white transition hover:scale-[1.02] shadow-[0_0_30px_rgba(99,102,241,.25)] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>

              </div>

            </motion.div>

          </div>

        </div>

      </section>

    </main>
  );
}
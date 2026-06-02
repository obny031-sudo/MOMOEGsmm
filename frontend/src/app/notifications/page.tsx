"use client";

import { useEffect, useState } from "react";
import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import { getNotifications, NotificationItem } from "@/lib/api/notifications";
import {
  Bell,
  Wallet,
  Rocket,
  ShieldAlert,
} from "lucide-react";

export default function NotificationPage(){
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  const iconFor=(t:string)=>{

    switch(t){

      case "wallet":
        return (
          <Wallet
            size={18}
            className="text-emerald-300"
          />
        );

      case "order":
        return (
          <Rocket
            size={18}
            className="text-indigo-300"
          />
        );

      default:
        return (
          <ShieldAlert
            size={18}
            className="text-red-300"
          />
        );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b14] text-white">

      <AmbientBackground/>
      <FloatingDock/>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-16">

        {/* top */}

        <div className="mb-7 flex items-center justify-between">

          <div>

            <div className="flex items-center gap-2 text-zinc-400">

              <Bell size={16}/>
              Live Activity

            </div>

            <h1 className="mt-2 text-4xl font-bold">

              Notifications

            </h1>

          </div>

          <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">

            Online

          </div>

        </div>

        {/* tabs */}

        <div className="mb-6 flex gap-3">

          {[
            "All",
            "Orders",
            "Wallet",
            "System",
          ].map((x)=>(

            <button
              key={x}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm hover:border-indigo-500/20 hover:bg-indigo-500/10"
            >
              {x}
            </button>

          ))}

        </div>

        {/* list */}

        <div className="space-y-3">

          {loading && (
            <p className="text-center text-zinc-500">Loading notifications...</p>
          )}

          {!loading && notifications.length === 0 && (
            <p className="text-center text-zinc-500">No notifications yet</p>
          )}

          {notifications.map(
            (n)=>(

              <div
                key={n.id}
                className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-indigo-500/20 hover:bg-indigo-500/[0.04]"
              >

                <div>

                  {iconFor(
                    n.type
                  )}

                </div>

                <div className="flex-1">

                  <div className="flex items-center justify-between">

                    <h3 className="font-medium">

                      {n.title}

                    </h3>

                    <span className="text-xs text-zinc-500">

                      {n.time}

                    </span>

                  </div>

                  <p className="mt-1 text-sm text-zinc-400">

                    {n.text}

                  </p>

                </div>

                <div className="h-2 w-2 rounded-full bg-emerald-400"/>

              </div>

            )
          )}

        </div>

      </section>

    </main>
  );
}
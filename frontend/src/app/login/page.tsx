"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);

const MotionButton = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.button),
  { ssr: false }
);

export default function LoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: true,
  });

  useEffect(() => {
    setMounted(true);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || sessionStorage.getItem("token")
        : null;

    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  if (!mounted) {
    return null;
  }

  const handleLogin = async () => {
    try {
      setError("");

      if (!form.email || !form.password) {
        return setError("Please fill all fields");
      }

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        return setError(data.message || "Login failed");
      }

      if (!data.token) {
        setLoading(false);
        return setError("No token received from server");
      }

      if (form.remember) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", data.token);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      setSuccess(true);

      setTimeout(() => {
        setLoading(false);
        router.replace("/dashboard");
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Server unavailable";

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,.12),transparent_25%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,.14),transparent_25%)]" />

      <section className="relative z-10 grid w-full max-w-6xl lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center px-12">
          <MotionDiv
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">
              <ShieldCheck size={18} />
              Elite Secure Login
            </div>

            <h1 className="mt-8 text-6xl font-black leading-none">
              MOMOEG
              <br />
              AUTH
            </h1>

            <p className="mt-5 max-w-md text-zinc-400">
              Enterprise-grade authentication connected directly with backend.
            </p>
          </MotionDiv>
        </div>

        <MotionDiv
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mx-auto w-full max-w-md rounded-[40px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,.55)]"
        >
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-emerald-500/30"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="text-center">
            <h2 className="text-4xl font-bold">Welcome Back</h2>
            <p className="mt-2 text-zinc-400">Secure Login Portal</p>
          </div>

          <div className="mt-7 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Mail size={18} />
              <input
                value={form.email}
                placeholder="Email"
                type="email"
                className="w-full bg-transparent outline-none placeholder-zinc-500"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Lock size={18} />
              <input
                value={form.password}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-transparent outline-none placeholder-zinc-500"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300">
                <CheckCircle2 size={16} />
                Login successful
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      remember: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                Remember me
              </label>

              <button className="text-emerald-300 hover:text-emerald-200 transition">
                Forgot?
              </button>
            </div>

            <MotionButton
              whileHover={{
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.98,
              }}
              disabled={loading}
              onClick={handleLogin}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 py-3 font-medium shadow-[0_0_35px_rgba(16,185,129,.25)] disabled:opacity-60 transition"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight size={18} />
                </>
              )}
            </MotionButton>
          </div>
        </MotionDiv>
      </section>
    </main>
  );
}
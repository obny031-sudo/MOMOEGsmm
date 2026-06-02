"use client";

import {
  useState,
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { ApiError, apiFetch } from "@/lib/api/client";
import { useAuth } from "@/components/auth/auth-provider";

import { motion } from "framer-motion";

import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";

import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const MotionDiv = motion.div;

export default function RegisterPage(){

  const router =
    useRouter();

  const auth = useAuth();

  const [

    mounted,
    setMounted

  ]=
    useState(false);

  const [

    showPassword,
    setShowPassword

  ]=
    useState(false);

  const [

    showConfirm,
    setShowConfirm

  ]=
    useState(false);

  const [

    loading,
    setLoading

  ]=
    useState(false);

  const [

    success,
    setSuccess

  ]=
    useState(false);

  const [

    error,
    setError

  ]=
    useState("");

  const [

    form,
    setForm

  ]=
    useState({

      username:"",
      email:"",
      password:"",
      confirmPassword:"",
      agree:false,

    });

  useEffect(()=>{

    setMounted(
      true
    );

    if (auth.isLoading) return;
    if (auth.isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  if (!mounted) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] text-white">
        <div className="rounded-[36px] border border-white/10 bg-white/[0.04] px-8 py-5 backdrop-blur-3xl text-zinc-400">
          Loading...
        </div>
      </main>
    );
  }

  const strength =
    form.password.length>=10
      ?100
      :form.password.length>=6
      ?60
      :form.password.length>0
      ?30
      :0;

  const passwordsMatch =

    form.password &&
    form.confirmPassword &&
    form.password===
    form.confirmPassword;

  const emailValid =

    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        form.email
      );

  /* Register */

  const handleRegister =
    async ()=>{

      try{

        setError("");

        if(

          !form.username ||
          !form.email ||
          !form.password

        ){

          return setError(
            "Fill all fields"
          );
        }

        if(

          form.username.length<3

        ){

          return setError(
            "Username too short"
          );
        }

        if(
          !emailValid
        ){

          return setError(
            "Invalid email"
          );
        }

        if(

          form.password.length<6

        ){

          return setError(
            "Weak password"
          );
        }

        if(
          !passwordsMatch
        ){

          return setError(
            "Passwords mismatch"
          );
        }

        if(
          !form.agree
        ){

          return setError(
            "Accept terms"
          );
        }

        setLoading(
          true
        );

        const data = await apiFetch<{
          success: boolean;
          token: string;
          user?: Record<string, unknown>;
        }>("/api/v1/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            password: form.password,
          }),
        });

        auth.login(
          data.token,
          data.user as Parameters<typeof auth.login>[1],
          true
        );

        setSuccess(
          true
        );

        setTimeout(()=>{

          router.replace(
            "/dashboard"
          );

        },1000);

      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Server unavailable"
        );
      } finally {

        setLoading(
          false
        );

      }

    };

  return(

    <main className="relative min-h-screen overflow-hidden text-white">

      <AmbientBackground/>
      <FloatingDock/>

      <section className="relative z-10 grid min-h-screen lg:grid-cols-2">

        <div className="hidden lg:flex flex-col justify-center px-16">

          <MotionDiv
            initial={{
              opacity:0,
              x:-30
            }}
            animate={{
              opacity:1,
              x:0
            }}
          >

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">

              <ShieldCheck
                size={18}
              />

              Elite Register

            </div>

            <h1 className="mt-8 text-6xl font-black">

              MOMOEG
              <br/>
              JOIN

            </h1>

          </MotionDiv>

        </div>

        <div className="flex items-center justify-center px-6 py-12">

          <MotionDiv
            initial={{
              opacity:0,
              y:30
            }}
            animate={{
              opacity:1,
              y:0
            }}
            className="w-full max-w-md rounded-[40px] border border-white/10 bg-white/[0.05] p-8 backdrop-blur-3xl shadow-[0_25px_80px_rgba(0,0,0,.55)]"
          >

            <h2 className="text-center text-4xl font-bold">

              Create Account

            </h2>

            <div className="mt-8 space-y-4">

              {/* Username */}

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">

                <User size={18}/>

                <input
                  placeholder="Username"
                  className="w-full bg-transparent outline-none"
                  onKeyDown={(e)=>
                    e.key==="Enter" &&
                    handleRegister()
                  }
                  onChange={(e)=>
                    setForm({
                      ...form,
                      username:e.target.value
                    })
                  }
                />

              </div>

              {/* Email */}

              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                form.email &&
                !emailValid
                  ? "border-red-500/30"
                  : "border-white/10"
              } bg-black/20`}>

                <Mail size={18}/>

                <input
                  placeholder="Email"
                  className="w-full bg-transparent outline-none"
                  onKeyDown={(e)=>
                    e.key==="Enter" &&
                    handleRegister()
                  }
                  onChange={(e)=>
                    setForm({
                      ...form,
                      email:e.target.value
                    })
                  }
                />

              </div>

              {/* Password */}

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">

                <Lock size={18}/>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Password"
                  className="w-full bg-transparent outline-none"
                  onKeyDown={(e)=>
                    e.key==="Enter" &&
                    handleRegister()
                  }
                  onChange={(e)=>
                    setForm({
                      ...form,
                      password:e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  onClick={()=>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword
                    ? <EyeOff size={18}/>
                    : <Eye size={18}/>
                  }
                </button>

              </div>

              {/* Strength */}

              <div className="h-2 rounded-full bg-white/10 overflow-hidden">

                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{
                    width:
                      `${strength}%`
                  }}
                />

              </div>

              {/* Confirm */}

              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                form.confirmPassword &&
                !passwordsMatch
                  ? "border-red-500/30"
                  : "border-white/10"
              } bg-black/20`}>

                <Lock size={18}/>

                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  placeholder="Confirm Password"
                  className="w-full bg-transparent outline-none"
                  onKeyDown={(e)=>
                    e.key==="Enter" &&
                    handleRegister()
                  }
                  onChange={(e)=>
                    setForm({
                      ...form,
                      confirmPassword:e.target.value
                    })
                  }
                />

                <button
                  type="button"
                  onClick={()=>
                    setShowConfirm(
                      !showConfirm
                    )
                  }
                >
                  {showConfirm
                    ? <EyeOff size={18}/>
                    : <Eye size={18}/>
                  }
                </button>

              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-300">
                  <AlertCircle size={16}/>
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-emerald-300">
                  <CheckCircle2 size={16}/>
                  Account created
                </div>
              )}

              <label className="flex items-center gap-3 text-sm text-zinc-400">

                <input
                  type="checkbox"
                  onChange={(e)=>
                    setForm({
                      ...form,
                      agree:e.target.checked
                    })
                  }
                />

                I agree to Terms

              </label>

              <button
                disabled={loading}
                onClick={handleRegister}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-400 py-3 font-medium disabled:opacity-60"
              >

                {loading
                  ? <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  : <>
                      Create Account
                      <ArrowRight
                        size={18}
                      />
                    </>
                }

              </button>

            </div>

          </MotionDiv>

        </div>

      </section>

    </main>
  );

}
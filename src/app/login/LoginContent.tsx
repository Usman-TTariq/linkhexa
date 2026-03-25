"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const benefits = [
  "No hidden fees. No contracts.",
  "No training and setup fees.",
  "Data imports and integration setup assistance.",
  "Live chat, video call and email support.",
];

const CheckIcon = () => (
  <svg className="h-5 w-5 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

export default function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Invalid email or password.");
        return;
      }
      if (!authData.session?.user) {
        setStatus("error");
        setErrorMessage("Login failed. Please try again.");
        return;
      }
      const user = authData.session.user;
      let { data: profile } = await supabase.from("profiles").select("approval_status").eq("id", user.id).maybeSingle();

      if (!profile) {
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const bootstrap = await fetch("/api/signup/complete", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: typeof meta.username === "string" ? meta.username : "",
            role: meta.role === "advertiser" || meta.role === "publisher" ? meta.role : "publisher",
            email: user.email ?? "",
            company_name: typeof meta.company_name === "string" ? meta.company_name : null,
            website: typeof meta.website === "string" ? meta.website : null,
            company_description: typeof meta.company_description === "string" ? meta.company_description : null,
            payment_email: typeof meta.payment_email === "string" ? meta.payment_email : null,
            tax_id: typeof meta.tax_id === "string" ? meta.tax_id : null,
            address: typeof meta.address === "string" ? meta.address : null,
            city: typeof meta.city === "string" ? meta.city : null,
            country: typeof meta.country === "string" ? meta.country : null,
          }),
        });
        if (!bootstrap.ok) {
          setStatus("error");
          setErrorMessage("Your account has no profile record yet. Please contact support or try signing up again.");
          await supabase.auth.signOut();
          return;
        }
        const refetch = await supabase.from("profiles").select("approval_status").eq("id", user.id).maybeSingle();
        profile = refetch.data ?? null;
      }

      const statusFromDb = profile?.approval_status;
      if (statusFromDb !== "approved") {
        await supabase.auth.signOut();
        setStatus("error");
        setErrorMessage(
          statusFromDb === "rejected"
            ? "Your account was not approved. Please contact support."
            : "Your account is pending approval. You can log in once an admin approves it."
        );
        return;
      }
      router.push("/dashboard");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: Info panel - LinkHexa theme (dark + indigo) */}
      <div className="relative flex flex-col justify-between bg-zinc-950 px-6 py-10 sm:px-10 sm:py-12 lg:w-[44%] lg:px-12 lg:py-16">
        <div className="absolute right-0 top-0 h-[280px] w-[280px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/LinkHexa Logo Svg.svg"
              alt="LinkHexa"
              width={140}
              height={44}
              className="h-9 w-auto"
            />
          </Link>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-12 text-2xl font-bold leading-tight text-white sm:text-3xl lg:mt-16 lg:text-4xl"
            style={{ fontFamily: "var(--font-libre-baskerville), serif" }}
          >
            Grow Your Online Revenue With Ease.
          </motion.h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="flex items-center gap-3 text-zinc-300"
              >
                <CheckIcon />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mt-10 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 lg:mt-0"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-white">Partner success</p>
            <p className="text-sm text-zinc-400">
              &quot;LinkHexa made it simple to grow my affiliate revenue. Support is responsive and the dashboard is easy to use.&quot;
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right: Login form - same dark theme, focused form area */}
      <div className="flex flex-1 flex-col justify-center bg-zinc-900/50 px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-zinc-400 transition-colors hover:text-white">
              <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={100} height={32} className="h-8 w-auto opacity-80" />
            </Link>
            <p className="text-sm text-zinc-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 lg:mt-16"
          >
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
              Welcome Back to <span className="text-indigo-400">LinkHexa</span>
            </h1>
            <p className="mt-2 text-zinc-400">Sign in to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5" suppressHydrationWarning>
              {status === "error" && (
                <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-400">{errorMessage}</p>
              )}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-indigo-400/90">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="you@linkhexa.com"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-indigo-400/90">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 transition-colors hover:text-zinc-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="mt-2 flex justify-end">
                  <Link href="/contact" className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-indigo-600 py-3.5 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-70"
              >
                {status === "loading" ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

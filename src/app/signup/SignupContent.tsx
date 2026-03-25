"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  { id: 1, label: "Account", sublabel: "Account Details" },
  { id: 2, label: "Company", sublabel: "Company Detail" },
  { id: 3, label: "Partner", sublabel: "Partner Details" },
];

const inputClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-10 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20";

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  "aria-label": string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-zinc-300"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
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
  );
}

export default function SignupContent() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") || "publisher") as "publisher" | "advertiser";
  const isPublisher = role === "publisher";

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [paymentEmail, setPaymentEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const title = isPublisher ? "Sign Up as a Publisher" : "Sign Up as an Advertiser";
  const subtitle = isPublisher
    ? "Register publisher account and turn your content into income with top brand partnerships."
    : "Register advertiser account and grow your brand with top affiliates and performance marketing.";

  const validateStep1 = () => {
    if (!username.trim()) {
      setErrorMessage("Username is required.");
      return false;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return false;
    }
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return false;
    }
    if (!agreeTerms) {
      setErrorMessage("Please agree to the privacy policy and terms.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step < 3) setStep(step + 1);
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            username: username.trim(),
            role,
            company_name: companyName.trim() || undefined,
            website: website.trim() || undefined,
            company_description: companyDescription.trim() || undefined,
            payment_email: paymentEmail.trim() || undefined,
            tax_id: taxId.trim() || undefined,
            address: address.trim() || undefined,
            city: city.trim() || undefined,
            country: country.trim() || undefined,
          },
        },
      });
      if (authError) {
        setStatus("error");
        setErrorMessage(authError.message || "Sign up failed.");
        return;
      }
      if (!authData.user) {
        setStatus("error");
        setErrorMessage("Sign up failed. Please try again.");
        return;
      }
      if (!authData.session) {
        setStatus("idle");
        router.push("/signup/thank-you?verify=1");
        return;
      }
      const completeRes = await fetch("/api/signup/complete", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          role,
          email: email.trim(),
          company_name: companyName.trim() || null,
          website: website.trim() || null,
          company_description: companyDescription.trim() || null,
          payment_email: paymentEmail.trim() || null,
          tax_id: taxId.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          country: country.trim() || null,
        }),
      });
      const completeJson = (await completeRes.json().catch(() => ({}))) as { error?: string };
      if (!completeRes.ok) {
        setStatus("error");
        setErrorMessage(completeJson.error ?? "Account created but profile could not be saved. Try logging in, or contact support.");
        return;
      }
      setStatus("idle");
      router.push("/signup/thank-you");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 sm:px-6 sm:py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-lg">
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Image src="/LinkHexa Logo Svg.svg" alt="LinkHexa" width={120} height={38} className="h-9 w-auto" />
          </Link>
        </div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl" style={{ fontFamily: "var(--font-libre-baskerville), serif" }}>
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
        </motion.div>

        {/* Stepper */}
        <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:h-10 sm:w-10 ${
                    step >= s.id ? "bg-indigo-500 text-white" : "border border-white/20 bg-white/5 text-zinc-500"
                  }`}
                >
                  {String(s.id).padStart(2, "0")}
                </div>
                <span className={`mt-1.5 text-xs font-medium sm:text-sm ${step >= s.id ? "text-indigo-400" : "text-zinc-500"}`}>
                  {s.label}
                </span>
                <span className="mt-0.5 hidden text-xs text-zinc-500 sm:block">{s.sublabel}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 sm:mx-2 ${step > s.id ? "bg-indigo-500/50" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-2xl border border-white/10 bg-zinc-900/80 p-6 backdrop-blur-sm sm:p-8"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white">Account Information</h2>
                <p className="mt-1 text-sm text-zinc-400">Enter your account details.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="mt-6 space-y-5" suppressHydrationWarning>
                  {status === "error" && (
                    <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-400">{errorMessage}</p>
                  )}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-username" className="block text-sm font-medium text-indigo-400/90">
                        Username <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="signup-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={inputClass.replace(" pr-10", "")}
                        placeholder="Choose a username"
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-email" className="block text-sm font-medium text-indigo-400/90">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass.replace(" pr-10", "")}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-password" className="block text-sm font-medium text-indigo-400/90">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <PasswordInput
                        id="signup-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        aria-label="Password"
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-confirm" className="block text-sm font-medium text-indigo-400/90">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <PasswordInput
                        id="signup-confirm"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        aria-label="Confirm password"
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-400">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-1 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span>
                      I agree to{" "}
                      <Link href="/privacy" className="font-medium text-indigo-400 hover:text-indigo-300">
                        privacy policy
                      </Link>{" "}
                      &{" "}
                      <Link href="/terms" className="font-medium text-indigo-400 hover:text-indigo-300">
                        terms
                      </Link>
                    </span>
                  </label>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      disabled
                      className="rounded-lg border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-500"
                    >
                      ← Previous
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      Next →
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white">Company Information</h2>
                <p className="mt-1 text-sm text-zinc-400">Enter your company or site details.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="mt-6 space-y-5" suppressHydrationWarning>
                  <div>
                    <label htmlFor="signup-company" className="block text-sm font-medium text-indigo-400/90">
                      Company name
                    </label>
                    <input
                      id="signup-company"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className={inputClass.replace(" pr-10", "")}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-website" className="block text-sm font-medium text-indigo-400/90">
                      Website
                    </label>
                    <input
                      id="signup-website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className={inputClass.replace(" pr-10", "")}
                      placeholder="Website"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-description" className="block text-sm font-medium text-indigo-400/90">
                      Description
                    </label>
                    <textarea
                      id="signup-description"
                      rows={4}
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Short description of your site or business"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-lg border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
                    >
                      ← Previous
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      Next →
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white">Partner Details</h2>
                <p className="mt-1 text-sm text-zinc-400">Payment and contact details for payouts.</p>
                <form onSubmit={handleSubmit} className="mt-6 space-y-5" suppressHydrationWarning>
                  {status === "error" && (
                    <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-400">{errorMessage}</p>
                  )}
                  <div>
                    <label htmlFor="signup-payment-email" className="block text-sm font-medium text-indigo-400/90">
                      Payment email
                    </label>
                    <input
                      id="signup-payment-email"
                      type="email"
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                      className={inputClass.replace(" pr-10", "")}
                      placeholder="Email for payouts"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-taxid" className="block text-sm font-medium text-indigo-400/90">
                      Tax ID <span className="text-zinc-500">(optional)</span>
                    </label>
                    <input
                      id="signup-taxid"
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className={inputClass.replace(" pr-10", "")}
                      placeholder="Tax ID (optional)"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-address" className="block text-sm font-medium text-indigo-400/90">
                      Address
                    </label>
                    <input
                      id="signup-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={inputClass.replace(" pr-10", "")}
                      placeholder="Address"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-city" className="block text-sm font-medium text-indigo-400/90">
                        City
                      </label>
                      <input
                        id="signup-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass.replace(" pr-10", "")}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label htmlFor="signup-country" className="block text-sm font-medium text-indigo-400/90">
                        Country
                      </label>
                      <input
                        id="signup-country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClass.replace(" pr-10", "")}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-lg border border-white/20 bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5"
                    >
                      ← Previous
                    </button>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-70"
                    >
                      {status === "loading" ? "Signing up…" : "Sign Up"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-zinc-500">
          or{" "}
          <Link href="/login" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
            Already have an account? Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}

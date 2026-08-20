"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Inscription réussie !");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de s'inscrire pour le moment.");
    }
  };

  return (
    <section
      className="relative overflow-hidden border-t border-gray-200 py-14 sm:py-16"
      aria-labelledby="newsletter-title"
    >
      <div className="absolute inset-0 lp-gradient-editorial opacity-95" aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(196,30,58,0.15),transparent_60%)]" aria-hidden="true" />

      <div className="lp-container relative">
        <div className="mx-auto max-w-2xl text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lp-accent/20">
            <Mail className="h-7 w-7 text-red-300" aria-hidden="true" />
          </div>
          <h2 id="newsletter-title" className="text-2xl font-bold sm:text-3xl">
            La newsletter {SITE_NAME}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/75">
            Recevez l&apos;essentiel de l&apos;actualité de Lubumbashi, de la RDC,
            de l&apos;Afrique et du monde — chaque matin dans votre boîte mail.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Votre adresse e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 border-0 px-5 py-3.5 text-lp-black placeholder:text-lp-muted focus:outline-none focus:ring-2 focus:ring-lp-accent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="lp-btn-accent shrink-0 px-8 py-3.5 disabled:opacity-60"
            >
              {status === "loading" ? "Envoi..." : "S'abonner"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 flex items-center justify-center gap-2 text-sm ${
                status === "success" ? "text-green-400" : "text-red-300"
              }`}
              role="status"
            >
              {status === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {message}
            </p>
          )}

          <p className="mt-6 text-xs text-white/40">
            Désabonnement possible à tout moment. Pas de spam.
          </p>
        </div>
      </div>
    </section>
  );
}

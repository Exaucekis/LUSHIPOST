"use client";

import { useState } from "react";

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
        setMessage(data.message || "Inscription réussie ! Vérifiez votre boîte mail.");
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
    <section className="bg-lp-anthracite py-12 text-white" aria-labelledby="newsletter-title">
      <div className="lp-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-2xl" aria-hidden="true">📩</span>
          <h2 id="newsletter-title" className="mt-2 text-2xl font-bold">
            La newsletter LUSHIPOST
          </h2>
          <p className="mt-3 text-white/70">
            Recevez l&apos;essentiel de l&apos;actualité de Lubumbashi, de la RDC,
            de l&apos;Afrique et du monde directement dans votre boîte mail.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Votre adresse e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse e-mail"
              required
              className="flex-1 border-0 px-4 py-3 text-lp-black focus:outline-none focus:ring-2 focus:ring-lp-accent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="lp-btn-accent px-8 py-3 disabled:opacity-50"
            >
              {status === "loading" ? "Envoi..." : "S'abonner"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-3 text-sm ${
                status === "success" ? "text-green-400" : "text-red-400"
              }`}
              role="status"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/layout/Logo";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { getSafeCallbackUrl } from "@/lib/navigation";

type Mode = "subscriber" | "staff";
type StaffStep = "email" | "password";
type SubscriberView = "sign-in" | "register";

function ConnexionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "staff" ? "staff" : "subscriber";
  const errorParam = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const { data: session, status: sessionStatus } = useSession();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [subscriberView, setSubscriberView] = useState<SubscriberView>("sign-in");
  const [staffStep, setStaffStep] = useState<StaffStep>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [emailMagicEnabled, setEmailMagicEnabled] = useState(false);

  useEffect(() => {
    if (errorParam === "staff-use-password") {
      setError("Les comptes rédaction se connectent avec e-mail et mot de passe.");
      setMode("staff");
    } else if (errorParam === "OAuthAccountNotLinked") {
      setError("Cette adresse est déjà utilisée avec une autre méthode de connexion.");
    } else if (errorParam) {
      setError("Connexion impossible. Réessayez.");
    }
  }, [errorParam]);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((providers) => {
        setGoogleEnabled(!!providers.google);
        setEmailMagicEnabled(!!providers.email);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user?.role) {
      router.replace(getSafeCallbackUrl(callbackUrl ?? null, session.user.role));
    }
  }, [callbackUrl, router, session?.user?.role, sessionStatus]);

  const handleSubscriberEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const checkRes = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const checkData = await checkRes.json();

    if (checkData.type === "staff") {
      setError("Cette adresse appartient à la rédaction. Utilisez l'onglet « Rédaction ».");
      setLoading(false);
      return;
    }

    if (!emailMagicEnabled) {
      setError("Connexion par e-mail indisponible. Utilisez Google ou contactez-nous.");
      setLoading(false);
      return;
    }

    const result = await signIn("email", {
      email: email.toLowerCase().trim(),
      redirect: false,
      callbackUrl: getSafeCallbackUrl(callbackUrl ?? null),
    });

    if (result?.error) {
      setError("Impossible d'envoyer le lien de connexion.");
      setLoading(false);
    } else {
      router.push("/connexion/verify");
    }
  };

  const handleStaffEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    const res = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (!res.ok || data.type !== "staff") {
      setError(
        data.type === "subscriber" || data.type === "new"
          ? "Cette adresse n'est pas enregistrée dans la rédaction. Contactez l'administrateur."
          : "Compte rédaction inactif."
      );
      setLoading(false);
      return;
    }

    setStaffRole(data.role);
    setStaffStep("password");
    setLoading(false);
  };

  const handleStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Mot de passe incorrect.");
      setLoading(false);
    } else {
      router.replace(getSafeCallbackUrl(callbackUrl ?? null, staffRole ?? undefined));
      router.refresh();
    }
  };

  const handleGoogle = () => {
    setLoading(true);
    setError("");
    setInfo("");
    void signIn("google", {
      callbackUrl: getSafeCallbackUrl(callbackUrl ?? null),
    }).catch(() => {
      setError("La connexion avec Google est temporairement indisponible. Réessayez dans quelques instants.");
      setLoading(false);
    });
  };

  const finishPasswordSignIn = async () => {
    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Adresse e-mail ou mot de passe incorrect.");
      setLoading(false);
      return;
    }
    router.replace(getSafeCallbackUrl(callbackUrl ?? null));
    router.refresh();
  };

  const handleSubscriberPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    await finishPasswordSignIn();
  };

  const handleRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Impossible de créer le compte.");
      await finishPasswordSignIn();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impossible de créer le compte.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-lp-light px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <Logo variant="header" />
          <p className="mt-4 text-xs uppercase tracking-widest text-lp-gray">
            Espace lecteur & rédaction
          </p>
        </div>

        <div className="mb-6 flex border border-gray-200">
          <button
            type="button"
            onClick={() => {
              setMode("subscriber");
              setStaffStep("email");
              setError("");
              setInfo("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              mode === "subscriber"
                ? "bg-lp-anthracite text-white"
                : "bg-white text-lp-gray hover:bg-gray-50"
            }`}
          >
            Abonné
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("staff");
              setStaffStep("email");
              setError("");
              setInfo("");
            }}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              mode === "staff"
                ? "bg-lp-anthracite text-white"
                : "bg-white text-lp-gray hover:bg-gray-50"
            }`}
          >
            Rédaction
          </button>
        </div>

        {mode === "subscriber" ? (
          <div className="space-y-4">
            {subscriberView === "register" ? (
              <>
                <div>
                  <p className="text-sm text-lp-gray">Créez votre compte gratuitement. Vous serez connecté dès la création du compte.</p>
                  <button type="button" onClick={() => { setSubscriberView("sign-in"); setError(""); }} className="mt-2 text-sm font-semibold text-lp-accent hover:underline">J&apos;ai déjà un compte</button>
                </div>
                <form onSubmit={handleRegistration} className="space-y-4">
                  <div>
                    <label htmlFor="register-name" className="mb-1 block text-xs font-bold uppercase tracking-wider">Nom affiché</label>
                    <input id="register-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} autoComplete="name" className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="register-email" className="mb-1 block text-xs font-bold uppercase tracking-wider">Votre e-mail</label>
                    <input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="register-password" className="mb-1 block text-xs font-bold uppercase tracking-wider">Mot de passe</label>
                    <input id="register-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none" />
                  </div>
                  <div>
                    <label htmlFor="register-password-confirmation" className="mb-1 block text-xs font-bold uppercase tracking-wider">Confirmer le mot de passe</label>
                    <input id="register-password-confirmation" type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength={8} autoComplete="new-password" className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none" />
                  </div>
                  <button type="submit" disabled={loading} className="lp-btn-primary w-full py-3 disabled:opacity-50">{loading ? "Création..." : "Créer mon compte"}</button>
                </form>
              </>
            ) : <>
            <p className="text-sm text-lp-gray">Connectez-vous pour suivre l&apos;actualité de Lubumbashi et personnaliser votre expérience.</p>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" onClick={() => { setSubscriberView("register"); setError(""); }} className="font-semibold text-lp-accent hover:underline">Créer un compte</button>
              <span className="text-lp-gray">ou utilisez Google / e-mail</span>
            </div>

            {googleEnabled && (
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 border border-gray-300 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Redirection vers Google..." : "Continuer avec Google"}
              </button>
            )}

            {googleEnabled && emailMagicEnabled && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-lp-gray">ou</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubscriberEmail} className="space-y-4">
              <div>
                <label htmlFor="sub-email" className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" />
                  Votre e-mail
                </label>
                <input
                  id="sub-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="vous@exemple.com"
                  className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="lp-btn-primary w-full py-3 disabled:opacity-50"
              >
                {loading ? "Envoi..." : emailMagicEnabled ? "Recevoir un lien de connexion" : "S'abonner"}
              </button>
            </form>

            <details className="border-t border-gray-100 pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-lp-anthracite">Se connecter avec un mot de passe</summary>
              <form onSubmit={handleSubscriberPassword} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="password-email" className="mb-1 block text-xs font-bold uppercase tracking-wider">Votre e-mail</label>
                  <input id="password-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none" />
                </div>
                <div>
                  <label htmlFor="subscriber-password" className="mb-1 block text-xs font-bold uppercase tracking-wider">Mot de passe</label>
                  <input id="subscriber-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none" />
                </div>
                <button type="submit" disabled={loading} className="lp-btn-primary w-full py-3 disabled:opacity-50">{loading ? "Connexion..." : "Se connecter"}</button>
              </form>
            </details>

            {!googleEnabled && !emailMagicEnabled && (
              <p className="rounded bg-amber-50 p-3 text-xs text-amber-800">
                La connexion Google n&apos;est pas encore configurée sur ce site.
              </p>
            )}
            </>}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-lp-gray">
              Accès réservé aux journalistes et administrateurs pré-inscrits.
            </p>

            {staffStep === "email" ? (
              <form onSubmit={handleStaffEmail} className="space-y-4">
                <div>
                  <label htmlFor="staff-email" className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <Mail className="h-3.5 w-3.5" />
                    E-mail professionnel
                  </label>
                  <input
                    id="staff-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="lp-btn-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? "Vérification..." : "Continuer"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleStaffPassword} className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setStaffStep("email");
                    setPassword("");
                    setError("");
                  }}
                  className="flex items-center gap-1 text-xs text-lp-gray hover:text-lp-accent"
                >
                  <ArrowLeft className="h-3 w-3" />
                  {email}
                </button>

                {staffRole && (
                  <p className="text-xs text-lp-accent">
                    {ROLE_LABELS[staffRole] || staffRole}
                  </p>
                )}

                <div>
                  <label htmlFor="staff-password" className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                    <Lock className="h-3.5 w-3.5" />
                    Mot de passe
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full border border-gray-300 px-4 py-3 focus:border-lp-accent focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="lp-btn-primary w-full py-3 disabled:opacity-50"
                >
                  {loading ? "Connexion..." : "Accéder à la newsroom"}
                </button>
              </form>
            )}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>
        )}
        {info && (
          <p className="mt-4 text-sm text-green-700" role="status">{info}</p>
        )}
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionForm />
    </Suspense>
  );
}

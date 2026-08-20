import type { Metadata } from "next";
import { getLiveEvents } from "@/lib/data/articles";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { LIVE_BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: LIVE_BRAND,
  description: "Couverture en direct des événements majeurs depuis Lubumbashi et la RDC.",
};

export default async function LivePage() {
  const events = await getLiveEvents().catch(() => []);

  return (
    <div className="lp-container py-8">
      <header className="mb-8 border-b-2 border-lp-breaking pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-lp-live lp-live-pulse" />
          <h1 className="text-2xl font-bold uppercase tracking-wide sm:text-3xl md:text-4xl">
            {LIVE_BRAND}
          </h1>
        </div>
        <p className="mt-3 text-lp-gray">
          Couverture en direct : conférences de presse, événements politiques et actualités majeures.
        </p>
      </header>

      {events.length > 0 ? (
        <div className="space-y-12">
          {events.map((event) => (
            <section key={event.id} className="border border-gray-200">
              <div className="flex items-center gap-2 bg-lp-breaking px-4 py-2 text-sm font-bold uppercase text-white">
                <span className="h-2 w-2 rounded-full bg-white lp-live-pulse" />
                {LIVE_BRAND}
              </div>
              <div className="grid gap-6 p-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h2 className="mb-2 text-2xl font-bold">{event.title}</h2>
                  {event.description && (
                    <p className="mb-4 text-lp-gray">{event.description}</p>
                  )}
                  {event.startedAt && (
                    <p className="mb-4 text-sm text-lp-gray">
                      Début : {event.startedAt.toLocaleString("fr-FR")}
                    </p>
                  )}
                  {(event.embedCode || event.streamUrl) && (
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {event.embedCode ? (
                        <div dangerouslySetInnerHTML={{ __html: event.embedCode }} />
                      ) : (
                        <iframe
                          src={event.streamUrl!}
                          title={event.title}
                          className="absolute inset-0 h-full w-full"
                          allowFullScreen
                        />
                      )}
                    </div>
                  )}
                </div>
                {event.article && (
                  <aside>
                    <h3 className="mb-4 text-sm font-bold uppercase">Articles associés</h3>
                    <ArticleCard article={event.article} variant="horizontal" />
                  </aside>
                )}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-xl text-lp-gray">Aucune diffusion en direct pour le moment.</p>
          <Link href="/" className="lp-btn-primary mt-6 inline-flex">
            Retour à l&apos;accueil
          </Link>
        </div>
      )}
    </div>
  );
}

import { PrismaClient, Role, ArticleStatus, ContentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Lubumbashi", slug: "lubumbashi", order: 1 },
  { name: "Haut-Katanga", slug: "haut-katanga", order: 2 },
  { name: "RDC", slug: "rdc", order: 3 },
  { name: "Politique", slug: "politique", order: 4 },
  { name: "Économie", slug: "economie", order: 5 },
  { name: "Société", slug: "societe", order: 6 },
  { name: "Justice", slug: "justice", order: 7 },
  { name: "Santé", slug: "sante", order: 8 },
  { name: "Éducation", slug: "education", order: 9 },
  { name: "Sport", slug: "sport", order: 10 },
  { name: "Culture", slug: "culture", order: 11 },
  { name: "Technologie", slug: "tech", order: 12 },
  { name: "Environnement", slug: "environnement", order: 13 },
  { name: "Afrique", slug: "afrique", order: 14 },
  { name: "International", slug: "international", order: 15 },
  { name: "Opinion", slug: "opinion", order: 16 },
  { name: "Enquête", slug: "enquete", order: 17 },
  { name: "Vérification", slug: "verification", order: 18 },
  { name: "Vidéo", slug: "video", order: 19 },
];

async function main() {
  console.log("🌱 Seeding LUBUMBASHIPOST database...");

  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lushipost.com" },
    update: {},
    create: {
      email: "admin@lushipost.com",
      passwordHash,
      name: "Rédaction LUBUMBASHIPOST",
      role: Role.SUPER_ADMIN,
    },
  });

  const journalist = await prisma.user.upsert({
    where: { email: "journaliste@lushipost.com" },
    update: {},
    create: {
      email: "journaliste@lushipost.com",
      passwordHash: await bcrypt.hash("journaliste123", 12),
      name: "Marie Kabongo",
      role: Role.JOURNALISTE,
    },
  });

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: cat,
    });
  }

  const author = await prisma.author.upsert({
    where: { slug: "redaction-lushipost" },
    update: {},
    create: {
      name: "Rédaction LUBUMBASHIPOST",
      slug: "redaction-lushipost",
      bio: "La rédaction de LUBUMBASHIPOST, média d'information basé à Lubumbashi.",
    },
  });

  const sourceLushipost = await prisma.source.upsert({
    where: { id: "source-lushipost" },
    update: {},
    create: { id: "source-lushipost", name: "LUBUMBASHIPOST" },
  });

  const catLubumbashi = await prisma.category.findUniqueOrThrow({ where: { slug: "lubumbashi" } });
  const catPolitique = await prisma.category.findUniqueOrThrow({ where: { slug: "politique" } });
  const catEconomie = await prisma.category.findUniqueOrThrow({ where: { slug: "economie" } });
  const catSport = await prisma.category.findUniqueOrThrow({ where: { slug: "sport" } });
  const catAfrique = await prisma.category.findUniqueOrThrow({ where: { slug: "afrique" } });
  const catIntl = await prisma.category.findUniqueOrThrow({ where: { slug: "international" } });
  const catRdc = await prisma.category.findUniqueOrThrow({ where: { slug: "rdc" } });
  const catHautKatanga = await prisma.category.findUniqueOrThrow({ where: { slug: "haut-katanga" } });

  const articles = [
    {
      title: "Haut-Katanga : les mines de cuivre et de cobalt redynamisent l'économie de Lubumbashi",
      slug: "lubumbashi-investissements-miniers-haut-katanga",
      subtitle: "Kamoto, Tenke Fungurume, Kipushi… Le Copperbelt congolais accélère sa production",
      excerpt: "Les sites miniers du Haut-Katanga, cœur historique de l'exploitation du cuivre et du cobalt en RDC, connaissent une reprise d'activité majeure. À Lubumbashi, capitale minière, opérateurs et autorités annoncent de nouveaux investissements.",
      content: `<p>Le Haut-Katanga concentre une part essentielle de la production congolaise de cuivre et de cobalt, minerais stratégiques pour l'industrie mondiale des batteries et de la transition énergétique.</p>
<h2>Une province minière au cœur de l'économie congolaise</h2>
<p>Autour de Lubumbashi, Likasi et Kipushi, les concessions historiques du Copperbelt — dont Kamoto Copper Company (KCC), Tenke Fungurume Mining (TFM) ou encore les projets de Kipushi — emploient des dizaines de milliers de travailleurs directs et indirects.</p>
<p>Les autorités provinciales ont présenté un plan de modernisation des infrastructures minières : routes d'accès, alimentation électrique, formation des jeunes aux métiers de l'extraction responsable et renforcement des contrôles environnementaux.</p>
<blockquote>« Le Haut-Katanga doit tirer profit de ses richesses minières tout en garantissant des retombées concrètes pour les populations de Lubumbashi et de toute la province », insiste la rédaction LUBUMBASHIPOST sur place.</blockquote>
<h2>Cuivre, cobalt et emplois locaux</h2>
<p>Le cuivre reste le principal levier d'exportation de la province. Le cobalt, lui, place la RDC au premier rang mondial des producteurs — un atout majeur pour Lubumbashi, où transitent une large part des activités logistiques et commerciales liées au secteur minier.</p>
<p>Les observateurs économiques saluent la relance, tout en appelant à une meilleure transparence sur les revenus miniers et à un développement équilibré des communes riveraines des sites d'exploitation.</p>`,
      categoryId: catHautKatanga.id,
      featuredImage: "/images/mine-artisanale-haut-katanga.png",
      featuredImageAlt: "Orpailleur au travail dans une rivière du Haut-Katanga",
      featuredImageCaption: "Exploitation artisanale minière. Photo : LUBUMBASHIPOST",
      geoZone: "Haut-Katanga",
      viewCount: 4821,
      isFeatured: true,
      isBreaking: true,
      keyPoints: [
        "Le Haut-Katanga concentre l'essentiel du cuivre et du cobalt congolais",
        "Kamoto, TFM et Kipushi parmi les sites majeurs du Copperbelt",
        "Lubumbashi reste la capitale économique du secteur minier en RDC",
      ],
    },
    {
      title: "RDC : le président reçoit les ambassadeurs du G7 à Kinshasa",
      slug: "rdc-president-ambassadeurs-g7-kinshasa",
      subtitle: "Discussions sur la coopération économique et la sécurité régionale",
      excerpt: "Le chef de l'État congolais a reçu une délégation d'ambassadeurs du G7 pour évoquer les enjeux de sécurité dans l'est du pays et les perspectives de partenariat économique.",
      content: `<p>Une rencontre de haut niveau s'est tenue ce lundi au Palais de la Nation à Kinshasa, réunissant le président de la République démocratique du Congo et les ambassadeurs des pays du G7.</p>
<p>Les discussions ont porté principalement sur la situation sécuritaire dans les provinces du Nord-Kivu et de l'Ituri, ainsi que sur les investissements dans les infrastructures.</p>`,
      categoryId: catPolitique.id,
      featuredImage: "https://images.unsplash.com/photo-1529107386315-e1a2ecb4819d?w=800&h=500&fit=crop",
      featuredImageAlt: "Palais présidentiel Kinshasa",
      viewCount: 3210,
    },
    {
      title: "Économie : le franc congolais se stabilise face au dollar",
      slug: "economie-franc-congolais-stabilisation",
      subtitle: "La Banque centrale du Congo intervient sur le marché des changes",
      excerpt: "Après plusieurs semaines de volatilité, le franc congolais affiche une relative stabilité grâce aux mesures prises par la BCC.",
      content: `<p>La Banque centrale du Congo a annoncé une série de mesures visant à stabiliser le taux de change du franc congolais face au dollar américain.</p>
<p>Les opérateurs économiques à Lubumbashi saluent cette intervention, espérant une baisse des prix à la consommation.</p>`,
      categoryId: catEconomie.id,
      featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=500&fit=crop",
      viewCount: 2150,
    },
    {
      title: "Sport : le TP Mazembe prépare la saison 2026-2027",
      slug: "sport-tp-mazembe-saison-2026",
      subtitle: "Le club lubumbashiens vise la Ligue des Champions CAF",
      excerpt: "Le Tout Puissant Mazembe entame sa préparation avec de nouvelles recrues et un staff technique renforcé.",
      content: `<p>Le TP Mazembe a officiellement lancé sa préparation pour la saison 2026-2027 au stade TP Mazembe de Lubumbashi.</p>
<p>Le président du club a confirmé l'arrivée de trois internationaux congolais et d'un entraîneur adjoint expérimenté.</p>`,
      categoryId: catSport.id,
      featuredImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop",
      viewCount: 3890,
    },
    {
      title: "Afrique centrale : sommet CEEAC sur la sécurité transfrontalière",
      slug: "afrique-sommet-ceeac-securite",
      subtitle: "Les chefs d'État réunis à Libreville",
      excerpt: "Le sommet de la CEEAC aborde les défis sécuritaires communs aux pays d'Afrique centrale.",
      content: `<p>Les dirigeants de la Communauté économique des États de l'Afrique centrale se sont réunis à Libreville pour un sommet consacré à la sécurité transfrontalière.</p>`,
      categoryId: catAfrique.id,
      africaRegion: "Afrique centrale",
      featuredImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=500&fit=crop",
      viewCount: 1560,
    },
    {
      title: "International : l'ONU appelle à un cessez-le-feu humanitaire",
      slug: "international-onu-cessez-le-feu",
      subtitle: "Résolution adoptée au Conseil de sécurité",
      excerpt: "Le Conseil de sécurité des Nations unies a adopté une résolution appelant à un cessez-le-feu humanitaire immédiat.",
      content: `<p>Le Conseil de sécurité de l'ONU a adopté à l'unanimité une résolution exigeant un cessez-le-feu humanitaire dans plusieurs zones de conflit.</p>`,
      categoryId: catIntl.id,
      intlRegion: "Moyen-Orient",
      featuredImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop",
      viewCount: 2890,
    },
    {
      title: "Likasi : inauguration d'un nouveau centre de santé communautaire",
      slug: "likasi-centre-sante-inauguration",
      subtitle: "Un investissement de 2 millions de dollars pour la santé publique",
      excerpt: "La ville de Likasi dispose désormais d'un centre de santé moderne capable d'accueillir 200 patients par jour.",
      content: `<p>Le ministre provincial de la Santé a inauguré ce mercredi un nouveau centre de santé communautaire à Likasi, deuxième ville du Haut-Katanga.</p>`,
      categoryId: catHautKatanga.id,
      geoZone: "Likasi",
      featuredImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop",
      viewCount: 980,
    },
    {
      title: "RDC : réforme du système éducatif, les enseignants réagissent",
      slug: "rdc-reforme-education-enseignants",
      subtitle: "Un nouveau curriculum national en discussion",
      excerpt: "Le ministère de l'Enseignement primaire, secondaire et technique présente un projet de réforme qui divise la communauté éducative.",
      content: `<p>Le gouvernement congolais a dévoilé les grandes lignes d'une réforme du système éducatif national, suscitant des réactions mitigées parmi les enseignants.</p>`,
      categoryId: catRdc.id,
      featuredImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=500&fit=crop",
      viewCount: 1340,
    },
  ];

  const now = new Date();
  for (const [index, article] of articles.entries()) {
    const publishedAt = new Date(now.getTime() - index * 3600000);
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        subtitle: article.subtitle,
        excerpt: article.excerpt,
        content: article.content,
        categoryId: article.categoryId,
        featuredImage: article.featuredImage,
        featuredImageAlt: article.featuredImageAlt,
        featuredImageCaption: article.featuredImageCaption,
        geoZone: article.geoZone,
        africaRegion: article.africaRegion,
        intlRegion: article.intlRegion,
        viewCount: article.viewCount,
        isFeatured: article.isFeatured ?? false,
        isBreaking: article.isBreaking ?? false,
        keyPoints: article.keyPoints ?? undefined,
        status: ArticleStatus.PUBLIE,
        publishedAt,
      },
      create: {
        ...article,
        status: ArticleStatus.PUBLIE,
        contentType: ContentType.FAITS,
        publishedAt,
        authorId: author.id,
        userId: admin.id,
        sourceId: sourceLushipost.id,
        readTimeMinutes: 4,
      },
    });
  }

  const mainArticle = await prisma.article.findUniqueOrThrow({
    where: { slug: "lubumbashi-investissements-miniers-haut-katanga" },
  });
  const article2 = await prisma.article.findUniqueOrThrow({
    where: { slug: "rdc-president-ambassadeurs-g7-kinshasa" },
  });
  const article3 = await prisma.article.findUniqueOrThrow({
    where: { slug: "economie-franc-congolais-stabilisation" },
  });
  const article4 = await prisma.article.findUniqueOrThrow({
    where: { slug: "sport-tp-mazembe-saison-2026" },
  });

  const slots = [
    { slot: "hero_main", articleId: mainArticle.id, order: 0 },
    { slot: "hero_secondary", articleId: article2.id, order: 0 },
    { slot: "hero_secondary", articleId: article3.id, order: 1 },
    { slot: "hero_secondary", articleId: article4.id, order: 2 },
  ];

  for (const slot of slots) {
    await prisma.homepageSlot.upsert({
      where: { slot_order: { slot: slot.slot, order: slot.order } },
      update: { articleId: slot.articleId },
      create: slot,
    });
  }

  await prisma.breakingNews.deleteMany({});
  await prisma.breakingNews.create({
    data: {
      title: "Haut-Katanga : les mines de cuivre et de cobalt en pleine activité autour de Lubumbashi",
      articleId: mainArticle.id,
      isActive: true,
      order: 0,
    },
  });

  await prisma.video.deleteMany({});
  await prisma.video.createMany({
    data: [
      {
        title: "Reportage : une journée dans les mines du Haut-Katanga",
        slug: "reportage-mines-haut-katanga",
        description: "Immersion au cœur de l'industrie minière congolaise.",
        thumbnail: "/images/mine-artisanale-haut-katanga.png",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        platform: "youtube",
        duration: 720,
        publishedAt: now,
      },
      {
        title: "Interview : le maire de Lubumbashi sur l'urbanisme",
        slug: "interview-maire-lubumbashi",
        description: "Entretien exclusif avec le maire de Lubumbashi.",
        thumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=640&h=360&fit=crop",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        platform: "youtube",
        duration: 480,
        publishedAt: new Date(now.getTime() - 86400000),
      },
    ],
  });

  await prisma.socialLink.deleteMany({});
  await prisma.socialLink.createMany({
    data: [
      { platform: "facebook", url: "#", order: 0 },
      { platform: "instagram", url: "#", order: 1 },
      { platform: "x", url: "#", order: 2 },
      { platform: "linkedin", url: "#", order: 3 },
      { platform: "tiktok", url: "#", order: 4 },
    ],
  });

  await prisma.setting.upsert({
    where: { key: "site_tagline" },
    update: {},
    create: { key: "site_tagline", value: "L'information au cœur de Lubumbashi." },
  });

  console.log("✅ Seed completed!");
  console.log("   Admin: admin@lushipost.com / admin123");
  console.log("   Journaliste: journaliste@lushipost.com / journaliste123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

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
  { name: "Vérification", slug: "verification", order: 17 },
  { name: "Vidéo", slug: "video", order: 18 },
];

async function main() {
  console.log("🌱 Seeding LUSHIPOST database...");

  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lushipost.com" },
    update: {},
    create: {
      email: "admin@lushipost.com",
      passwordHash,
      name: "Rédaction LUSHIPOST",
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
      update: {},
      create: cat,
    });
  }

  const author = await prisma.author.upsert({
    where: { slug: "redaction-lushipost" },
    update: {},
    create: {
      name: "Rédaction LUSHIPOST",
      slug: "redaction-lushipost",
      bio: "La rédaction de LUSHIPOST, média d'information basé à Lubumbashi.",
    },
  });

  const sourceLushipost = await prisma.source.upsert({
    where: { id: "source-lushipost" },
    update: {},
    create: { id: "source-lushipost", name: "LUSHIPOST" },
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
      title: "Lubumbashi : le gouverneur du Haut-Katanga annonce de nouveaux investissements miniers",
      slug: "lubumbashi-investissements-miniers-haut-katanga",
      subtitle: "Un plan de développement économique de 500 millions de dollars présenté ce mardi",
      excerpt: "Le gouverneur du Haut-Katanga a dévoilé un ambitieux plan d'investissement visant à moderniser l'infrastructure minière de la province et créer des milliers d'emplois locaux.",
      content: `<p>En marge d'une conférence de presse tenue à Lubumbashi, le gouverneur du Haut-Katanga a présenté un plan de développement économique d'une envergure inédite pour la province.</p>
<h2>Un plan structurant pour la province</h2>
<p>Le programme, évalué à 500 millions de dollars, prévoit la modernisation des sites miniers, la construction de routes d'accès et la formation de 5 000 jeunes aux métiers de l'extraction responsable.</p>
<blockquote>« Notre ambition est de faire du Haut-Katanga un modèle de développement minier durable en Afrique centrale », a déclaré le gouverneur.</blockquote>
<p>Les premiers chantiers devraient démarrer dès le troisième trimestre 2026, avec un accent particulier sur les communes de Kamalondo et Kenya.</p>`,
      categoryId: catLubumbashi.id,
      featuredImage: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=675&fit=crop",
      featuredImageAlt: "Vue aérienne de Lubumbashi",
      featuredImageCaption: "Lubumbashi, capitale économique du Haut-Katanga. Photo : Unsplash",
      geoZone: "Lubumbashi",
      viewCount: 4821,
      isFeatured: true,
      isBreaking: true,
      keyPoints: ["Plan de 500 M$ pour le Haut-Katanga", "5 000 emplois prévus", "Démarrage des travaux en Q3 2026"],
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
      update: {},
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
      title: "Lubumbashi : le gouverneur annonce un plan d'investissement de 500 M$ pour le Haut-Katanga",
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
        thumbnail: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&h=360&fit=crop",
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

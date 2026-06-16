import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Villes du Cameroun (chefs-lieux régionaux, départementaux et nombreux
// arrondissements / petites villes), par région. Coordonnées pour les grandes.
const VILLES: { nom: string; region: string; lat?: number; lng?: number }[] = [
  // Littoral
  { nom: "Douala", region: "Littoral", lat: 4.0511, lng: 9.7679 },
  { nom: "Édéa", region: "Littoral" }, { nom: "Nkongsamba", region: "Littoral" },
  { nom: "Loum", region: "Littoral" }, { nom: "Mbanga", region: "Littoral" },
  { nom: "Manjo", region: "Littoral" }, { nom: "Yabassi", region: "Littoral" },
  { nom: "Dizangué", region: "Littoral" }, { nom: "Penja", region: "Littoral" },
  { nom: "Melong", region: "Littoral" }, { nom: "Pouma", region: "Littoral" },
  { nom: "Dibombari", region: "Littoral" }, { nom: "Souza", region: "Littoral" },
  { nom: "Nkondjock", region: "Littoral" }, { nom: "Ngambè", region: "Littoral" },
  { nom: "Yingui", region: "Littoral" }, { nom: "Bonaléa", region: "Littoral" },
  // Centre
  { nom: "Yaoundé", region: "Centre", lat: 3.848, lng: 11.5021 },
  { nom: "Mbalmayo", region: "Centre" }, { nom: "Obala", region: "Centre" },
  { nom: "Bafia", region: "Centre" }, { nom: "Monatélé", region: "Centre" },
  { nom: "Akonolinga", region: "Centre" }, { nom: "Mfou", region: "Centre" },
  { nom: "Ngoumou", region: "Centre" }, { nom: "Éséka", region: "Centre" },
  { nom: "Nanga-Eboko", region: "Centre" }, { nom: "Bokito", region: "Centre" },
  { nom: "Ntui", region: "Centre" }, { nom: "Saa", region: "Centre" },
  { nom: "Ombessa", region: "Centre" }, { nom: "Soa", region: "Centre" },
  { nom: "Mbankomo", region: "Centre" }, { nom: "Évodoula", region: "Centre" },
  { nom: "Makénéné", region: "Centre" }, { nom: "Yoko", region: "Centre" },
  { nom: "Mbangassina", region: "Centre" }, { nom: "Ayos", region: "Centre" },
  { nom: "Awae", region: "Centre" }, { nom: "Endom", region: "Centre" },
  // Ouest
  { nom: "Bafoussam", region: "Ouest", lat: 5.4781, lng: 10.4174 },
  { nom: "Dschang", region: "Ouest" }, { nom: "Mbouda", region: "Ouest" },
  { nom: "Foumban", region: "Ouest" }, { nom: "Bandjoun", region: "Ouest" },
  { nom: "Bangangté", region: "Ouest" }, { nom: "Foumbot", region: "Ouest" },
  { nom: "Bafang", region: "Ouest" }, { nom: "Bana", region: "Ouest" },
  { nom: "Baham", region: "Ouest" }, { nom: "Bayangam", region: "Ouest" },
  { nom: "Penka-Michel", region: "Ouest" }, { nom: "Kekem", region: "Ouest" },
  { nom: "Bandja", region: "Ouest" }, { nom: "Batié", region: "Ouest" },
  { nom: "Bangou", region: "Ouest" }, { nom: "Bazou", region: "Ouest" },
  { nom: "Tonga", region: "Ouest" }, { nom: "Massangam", region: "Ouest" },
  { nom: "Magba", region: "Ouest" }, { nom: "Malentouen", region: "Ouest" },
  { nom: "Koutaba", region: "Ouest" }, { nom: "Njimom", region: "Ouest" },
  { nom: "Galim", region: "Ouest" }, { nom: "Babadjou", region: "Ouest" },
  { nom: "Bamendjou", region: "Ouest" }, { nom: "Bamougoum", region: "Ouest" },
  { nom: "Baleng", region: "Ouest" }, { nom: "Bamendou", region: "Ouest" },
  // Sud-Ouest (anglophone)
  { nom: "Buea", region: "Sud-Ouest (anglophone)", lat: 4.1537, lng: 9.241 },
  { nom: "Limbe", region: "Sud-Ouest (anglophone)", lat: 4.0228, lng: 9.1955 },
  { nom: "Kumba", region: "Sud-Ouest (anglophone)", lat: 4.6363, lng: 9.4469 },
  { nom: "Tiko", region: "Sud-Ouest (anglophone)" }, { nom: "Mamfe", region: "Sud-Ouest (anglophone)" },
  { nom: "Mutengene", region: "Sud-Ouest (anglophone)" }, { nom: "Muyuka", region: "Sud-Ouest (anglophone)" },
  { nom: "Bangem", region: "Sud-Ouest (anglophone)" }, { nom: "Tombel", region: "Sud-Ouest (anglophone)" },
  { nom: "Mundemba", region: "Sud-Ouest (anglophone)" }, { nom: "Ekondo-Titi", region: "Sud-Ouest (anglophone)" },
  { nom: "Mbonge", region: "Sud-Ouest (anglophone)" }, { nom: "Konye", region: "Sud-Ouest (anglophone)" },
  { nom: "Nguti", region: "Sud-Ouest (anglophone)" }, { nom: "Wabane", region: "Sud-Ouest (anglophone)" },
  { nom: "Fontem", region: "Sud-Ouest (anglophone)" }, { nom: "Akwaya", region: "Sud-Ouest (anglophone)" },
  { nom: "Eyumojock", region: "Sud-Ouest (anglophone)" }, { nom: "Idenau", region: "Sud-Ouest (anglophone)" },
  { nom: "Toko", region: "Sud-Ouest (anglophone)" },
  // Nord-Ouest (anglophone)
  { nom: "Bamenda", region: "Nord-Ouest (anglophone)", lat: 5.9597, lng: 10.1459 },
  { nom: "Kumbo", region: "Nord-Ouest (anglophone)" }, { nom: "Ndop", region: "Nord-Ouest (anglophone)" },
  { nom: "Wum", region: "Nord-Ouest (anglophone)" }, { nom: "Nkambé", region: "Nord-Ouest (anglophone)" },
  { nom: "Fundong", region: "Nord-Ouest (anglophone)" }, { nom: "Mbengwi", region: "Nord-Ouest (anglophone)" },
  { nom: "Batibo", region: "Nord-Ouest (anglophone)" }, { nom: "Bali", region: "Nord-Ouest (anglophone)" },
  { nom: "Bafut", region: "Nord-Ouest (anglophone)" }, { nom: "Santa", region: "Nord-Ouest (anglophone)" },
  { nom: "Tubah", region: "Nord-Ouest (anglophone)" }, { nom: "Ndu", region: "Nord-Ouest (anglophone)" },
  { nom: "Oku", region: "Nord-Ouest (anglophone)" }, { nom: "Belo", region: "Nord-Ouest (anglophone)" },
  { nom: "Njinikom", region: "Nord-Ouest (anglophone)" }, { nom: "Jakiri", region: "Nord-Ouest (anglophone)" },
  { nom: "Misaje", region: "Nord-Ouest (anglophone)" }, { nom: "Ako", region: "Nord-Ouest (anglophone)" },
  { nom: "Widikum", region: "Nord-Ouest (anglophone)" },
  // Sud
  { nom: "Ebolowa", region: "Sud", lat: 2.915, lng: 11.15 },
  { nom: "Kribi", region: "Sud", lat: 2.9404, lng: 9.91 },
  { nom: "Sangmélima", region: "Sud" }, { nom: "Ambam", region: "Sud" },
  { nom: "Djoum", region: "Sud" }, { nom: "Mvangan", region: "Sud" },
  { nom: "Akom II", region: "Sud" }, { nom: "Campo", region: "Sud" },
  { nom: "Lolodorf", region: "Sud" }, { nom: "Niété", region: "Sud" },
  { nom: "Bipindi", region: "Sud" }, { nom: "Meyomessala", region: "Sud" },
  { nom: "Zoétélé", region: "Sud" }, { nom: "Olamze", region: "Sud" },
  { nom: "Ma'an", region: "Sud" }, { nom: "Kye-Ossi", region: "Sud" },
  { nom: "Mengong", region: "Sud" }, { nom: "Oveng", region: "Sud" },
  // Est
  { nom: "Bertoua", region: "Est", lat: 4.5774, lng: 13.6846 },
  { nom: "Batouri", region: "Est" }, { nom: "Abong-Mbang", region: "Est" },
  { nom: "Yokadouma", region: "Est" }, { nom: "Garoua-Boulaï", region: "Est" },
  { nom: "Bélabo", region: "Est" }, { nom: "Doumé", region: "Est" },
  { nom: "Dimako", region: "Est" }, { nom: "Lomié", region: "Est" },
  { nom: "Ndélélé", region: "Est" }, { nom: "Kette", region: "Est" },
  { nom: "Moloundou", region: "Est" }, { nom: "Messamena", region: "Est" },
  { nom: "Mindourou", region: "Est" }, { nom: "Ngoura", region: "Est" },
  { nom: "Bétaré-Oya", region: "Est" },
  // Adamaoua
  { nom: "Ngaoundéré", region: "Adamaoua", lat: 7.3167, lng: 13.5833 },
  { nom: "Tibati", region: "Adamaoua" }, { nom: "Tignère", region: "Adamaoua" },
  { nom: "Banyo", region: "Adamaoua" }, { nom: "Meiganga", region: "Adamaoua" },
  { nom: "Djohong", region: "Adamaoua" }, { nom: "Belel", region: "Adamaoua" },
  { nom: "Mbé", region: "Adamaoua" }, { nom: "Ngaoundal", region: "Adamaoua" },
  { nom: "Dir", region: "Adamaoua" }, { nom: "Kontcha", region: "Adamaoua" },
  { nom: "Martap", region: "Adamaoua" }, { nom: "Nyambaka", region: "Adamaoua" },
  // Nord
  { nom: "Garoua", region: "Nord", lat: 9.3017, lng: 13.3921 },
  { nom: "Guider", region: "Nord" }, { nom: "Figuil", region: "Nord" },
  { nom: "Pitoa", region: "Nord" }, { nom: "Lagdo", region: "Nord" },
  { nom: "Poli", region: "Nord" }, { nom: "Tcholliré", region: "Nord" },
  { nom: "Touboro", region: "Nord" }, { nom: "Rey-Bouba", region: "Nord" },
  { nom: "Bibémi", region: "Nord" }, { nom: "Ngong", region: "Nord" },
  { nom: "Mayo-Oulo", region: "Nord" }, { nom: "Gashiga", region: "Nord" },
  { nom: "Demsa", region: "Nord" }, { nom: "Bascheo", region: "Nord" },
  // Extrême-Nord
  { nom: "Maroua", region: "Extrême-Nord", lat: 10.591, lng: 14.3159 },
  { nom: "Kousséri", region: "Extrême-Nord" }, { nom: "Mokolo", region: "Extrême-Nord" },
  { nom: "Yagoua", region: "Extrême-Nord" }, { nom: "Kaélé", region: "Extrême-Nord" },
  { nom: "Mora", region: "Extrême-Nord" }, { nom: "Mindif", region: "Extrême-Nord" },
  { nom: "Koza", region: "Extrême-Nord" }, { nom: "Tokombéré", region: "Extrême-Nord" },
  { nom: "Waza", region: "Extrême-Nord" }, { nom: "Makary", region: "Extrême-Nord" },
  { nom: "Goulfey", region: "Extrême-Nord" }, { nom: "Bogo", region: "Extrême-Nord" },
  { nom: "Pétté", region: "Extrême-Nord" }, { nom: "Méri", region: "Extrême-Nord" },
  { nom: "Maga", region: "Extrême-Nord" }, { nom: "Kalfou", region: "Extrême-Nord" },
  { nom: "Moutourwa", region: "Extrême-Nord" }, { nom: "Hina", region: "Extrême-Nord" },
  { nom: "Bourha", region: "Extrême-Nord" }, { nom: "Datcheka", region: "Extrême-Nord" },
];

const PROS = [
  { email: "sandra@demo.cm", pseudo: "Sandra K.", ville: "Douala", cat: "MASSAGE", prix: 15000, titre: "Massage relaxant à Akwa", note: 4.9, avis: 128 },
  { email: "lea@demo.cm", pseudo: "Léa", ville: "Douala", cat: "RENCONTRE", prix: 20000, titre: "Rencontre en soirée", note: 4.7, avis: 86 },
  { email: "mia@demo.cm", pseudo: "Mia", ville: "Yaoundé", cat: "SPA", prix: 10000, titre: "Spa & bien-être", note: 5.0, avis: 54 },
  { email: "nora@demo.cm", pseudo: "Nora", ville: "Douala", cat: "MASSAGE", prix: 18000, titre: "Massage premium", note: 4.8, avis: 203 },
  { email: "awa@demo.cm", pseudo: "Awa", ville: "Yaoundé", cat: "RENCONTRE", prix: 14000, titre: "Soirée détente", note: 4.9, avis: 97 },
  { email: "flora@demo.cm", pseudo: "Flora", ville: "Buea", cat: "RENCONTRE", prix: 13000, titre: "Rendez-vous à Buea", note: 4.7, avis: 58 },
];

const CLIENTS = [
  { email: "jean@demo.cm", pseudo: "Jean P." },
  { email: "client@demo.cm", pseudo: "Client vérifié" },
];

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const cm = await db.pays.upsert({
    where: { code: "CM" },
    update: {},
    create: { code: "CM", nom: "Cameroun", devise: "XAF", locale: "fr", indicatifTel: "+237", actif: true },
  });

  for (const v of VILLES) {
    const slug = slugify(v.nom);
    await db.ville.upsert({
      where: { paysId_slug: { paysId: cm.id, slug } },
      update: { nom: v.nom, region: v.region, latitude: v.lat ?? null, longitude: v.lng ?? null },
      create: { nom: v.nom, slug, region: v.region, latitude: v.lat ?? null, longitude: v.lng ?? null, paysId: cm.id },
    });
  }
  console.log(`${VILLES.length} villes seedées.`);

  if ((await db.annonce.count()) > 0) {
    console.log("Données de démo déjà présentes.");
    return;
  }

  const clients = [];
  let i = 0;
  for (const c of CLIENTS) {
    const u = await db.user.create({
      data: {
        email: c.email, role: "CLIENT", paysId: cm.id, codeParrainage: `CONF-CLI${i++}`,
        telephoneVerifie: true, niveauVerification: 1,
        profil: { create: { pseudo: c.pseudo } }, portefeuille: { create: { solde: 0 } },
      },
    });
    clients.push(u);
  }

  let j = 0;
  for (const pro of PROS) {
    const ville = await db.ville.findFirst({ where: { paysId: cm.id, slug: slugify(pro.ville) } });
    if (!ville) continue;
    const user = await db.user.create({
      data: {
        email: pro.email, role: "PRO", paysId: cm.id, codeParrainage: `CONF-PRO${j++}`,
        telephoneVerifie: true, identiteVerifiee: true, niveauVerification: 2,
        profil: { create: { pseudo: pro.pseudo, villeId: ville.id, noteMoyenne: pro.note, nombreAvis: pro.avis, tauxReponse: 96, scoreReputation: pro.note * 20 } },
        portefeuille: { create: { solde: 0 } },
      },
    });
    const annonce = await db.annonce.create({
      data: {
        titre: pro.titre,
        description: `${pro.titre}. Sur rendez-vous, cadre discret. Photos floutées pour préserver l'anonymat. Identité vérifiée.`,
        categorie: pro.cat as "RENCONTRE" | "MASSAGE" | "SPA",
        prix: pro.prix, statut: "ACTIVE", userId: user.id, villeId: ville.id,
        medias: { create: [0, 1, 2, 3].map((o) => ({ type: "PHOTO" as const, url: `/media/placeholder-${o}.jpg`, floutee: true, visagesFloutes: 1, ordre: o })) },
      },
    });
    await db.avis.create({ data: { annonceId: annonce.id, auteurId: clients[0].id, note: 5, noteQualite: 5, notePonctualite: 5, noteAccueil: 5, noteRapportQualitePrix: 4, noteSatisfaction: 5, commentaire: "Très professionnelle, ponctuelle et accueillante. Je recommande." } });
    await db.avis.create({ data: { annonceId: annonce.id, auteurId: clients[1].id, note: 4, noteQualite: 4, noteAccueil: 5, noteRapportQualitePrix: 4, noteSatisfaction: 4, commentaire: "Cadre propre et discret, conforme à l'annonce." } });
  }

  console.log(`Seed OK — ${await db.annonce.count()} annonces de démo.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); });

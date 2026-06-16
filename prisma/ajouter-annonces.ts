import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const NOUVELLES = [
  { email: "carla@demo.cm", pseudo: "Carla", ville: "Douala", cat: "MASSAGE", prix: 17000, titre: "Massage californien à Bonapriso", note: 4.8, avis: 64 },
  { email: "ines@demo.cm", pseudo: "Inès", ville: "Yaoundé", cat: "RENCONTRE", prix: 22000, titre: "Rencontre raffinée au centre-ville", note: 4.9, avis: 110 },
  { email: "daniela@demo.cm", pseudo: "Daniela", ville: "Bafoussam", cat: "SPA", prix: 12000, titre: "Spa & hammam détente", note: 4.7, avis: 38 },
  { email: "sonia@demo.cm", pseudo: "Sonia", ville: "Kribi", cat: "MASSAGE", prix: 16000, titre: "Massage en bord de mer", note: 5.0, avis: 47 },
  { email: "vanessa@demo.cm", pseudo: "Vanessa", ville: "Limbe", cat: "RENCONTRE", prix: 15000, titre: "Soirée détente à Limbe", note: 4.6, avis: 29 },
];

const CLIENTS = [
  { email: "jean@demo.cm", pseudo: "Jean P.", code: "CONF-CLI0" },
  { email: "client@demo.cm", pseudo: "Client vérifié", code: "CONF-CLI1" },
];

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const cm = await db.pays.findUnique({ where: { code: "CM" } });
  if (!cm) {
    console.error("Pays CM introuvable — lancez d'abord `npm run db:seed`.");
    process.exit(1);
  }

  // Auteurs d'avis
  const clients = [];
  for (const c of CLIENTS) {
    const u = await db.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email, role: "CLIENT", paysId: cm.id, codeParrainage: c.code,
        telephoneVerifie: true, niveauVerification: 1,
        profil: { create: { pseudo: c.pseudo } }, portefeuille: { create: { solde: 0 } },
      },
    });
    clients.push(u);
  }

  let crees = 0;
  let g = 0;
  for (const pro of NOUVELLES) {
    const ville = await db.ville.findFirst({ where: { paysId: cm.id, slug: slugify(pro.ville) } });
    if (!ville) { console.warn(`Ville ${pro.ville} absente, ignorée.`); continue; }

    const user = await db.user.upsert({
      where: { email: pro.email },
      update: {},
      create: {
        email: pro.email, role: "PRO", paysId: cm.id, codeParrainage: `CONF-GEN${g++}`,
        telephoneVerifie: true, identiteVerifiee: true, niveauVerification: 2,
        profil: { create: { pseudo: pro.pseudo, villeId: ville.id, noteMoyenne: pro.note, nombreAvis: pro.avis, tauxReponse: 95, scoreReputation: pro.note * 20 } },
        portefeuille: { create: { solde: 0 } },
      },
    });

    // N'ajoute l'annonce que si ce pro n'en a pas déjà
    if ((await db.annonce.count({ where: { userId: user.id } })) > 0) continue;

    const annonce = await db.annonce.create({
      data: {
        titre: pro.titre,
        description: `${pro.titre}. Sur rendez-vous, cadre discret et propre. Photos floutées pour préserver l'anonymat. Identité vérifiée.`,
        categorie: pro.cat as "RENCONTRE" | "MASSAGE" | "SPA",
        prix: pro.prix, statut: "ACTIVE", userId: user.id, villeId: ville.id,
        medias: { create: [0, 1, 2, 3].map((o) => ({ type: "PHOTO" as const, url: `/media/placeholder-${o}.jpg`, floutee: true, visagesFloutes: 1, ordre: o })) },
      },
    });

    await db.avis.create({ data: { annonceId: annonce.id, auteurId: clients[0].id, note: 5, noteQualite: 5, notePonctualite: 5, noteAccueil: 5, noteRapportQualitePrix: 4, noteSatisfaction: 5, commentaire: "Excellent accueil, très professionnelle. Je recommande vivement." } });
    await db.avis.create({ data: { annonceId: annonce.id, auteurId: clients[1].id, note: 4, noteQualite: 4, noteAccueil: 5, noteRapportQualitePrix: 4, noteSatisfaction: 4, commentaire: "Conforme à l'annonce, cadre agréable et discret." } });
    crees++;
  }

  console.log(`${crees} nouvelle(s) annonce(s) active(s) ajoutée(s). Total annonces : ${await db.annonce.count()}.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); });

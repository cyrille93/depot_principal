import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// On marque quelques annonces de démo pour que les filtres Urgent/VIP/TOP/Premium
// renvoient des résultats. Mise en avant valable 4 jours (≤ 5).
const ATTRIBUTIONS: { email: string; niveau: "URGENT" | "VIP" | "TOP" | "PREMIUM" }[] = [
  { email: "sandra@demo.cm", niveau: "VIP" },
  { email: "lea@demo.cm", niveau: "TOP" },
  { email: "mia@demo.cm", niveau: "PREMIUM" },
  { email: "nora@demo.cm", niveau: "URGENT" },
  { email: "carla@demo.cm", niveau: "VIP" },
  { email: "ines@demo.cm", niveau: "PREMIUM" },
  { email: "daniela@demo.cm", niveau: "TOP" },
  { email: "sonia@demo.cm", niveau: "URGENT" },
];

async function main() {
  const expire = new Date();
  expire.setDate(expire.getDate() + 4);

  let n = 0;
  for (const a of ATTRIBUTIONS) {
    const user = await db.user.findUnique({ where: { email: a.email }, select: { id: true } });
    if (!user) continue;
    const res = await db.annonce.updateMany({
      where: { userId: user.id },
      data: { miseEnAvant: a.niveau, estBoostee: true, boostExpire: expire },
    });
    n += res.count;
  }
  console.log(`${n} annonce(s) mise(s) en avant (valable jusqu'au ${expire.toLocaleDateString("fr-FR")}).`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); });

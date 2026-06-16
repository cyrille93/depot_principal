import { NextResponse } from "next/server";
import { getParametre } from "@/lib/parametres";

export const dynamic = "force-dynamic";

// Sert le logo courant : image personnalisée (base) si définie, sinon le fichier par défaut.
export async function GET(request: Request) {
  const data = await getParametre("logo");
  if (data && data.startsWith("data:")) {
    const m = data.match(/^data:(image\/[a-z]+);base64,(.*)$/);
    if (m) {
      const buf = Buffer.from(m[2], "base64");
      return new NextResponse(buf, {
        headers: { "Content-Type": m[1], "Cache-Control": "no-store" },
      });
    }
  }
  return NextResponse.redirect(new URL("/logo-rose-annonce.png", request.url), 307);
}

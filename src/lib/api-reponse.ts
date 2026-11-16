import { NextResponse } from "next/server";

// Réponses JSON cohérentes pour l'API admin (Power Apps / Custom Connector).

export function reponseOk(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// Forme d'erreur stable : { error: { code, message, details? } }
export function reponseErreur(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    { error: { code, message, ...(details !== undefined ? { details } : {}) } },
    { status }
  );
}

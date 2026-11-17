// Authentification de l'API admin via Microsoft Entra ID (OAuth 2.0, flux délégué).
//
// Chaque requête doit porter un jeton Bearer émis par Entra ID pour CETTE API.
// On valide : signature (clés publiques JWKS du tenant), émetteur (iss),
// audience (aud), expiration — ET la présence du rôle administrateur requis
// (claim "roles", avec "scp" en secours). Aucun accès sans jeton valide d'un
// compte explicitement autorisé dans Entra.
//
// Variables d'environnement attendues (serveur, jamais exposées) :
//   ENTRA_TENANT_ID      : GUID (ou domaine) du tenant Entra ID
//   ENTRA_API_AUDIENCE   : audience attendue du jeton (App ID URI, ex. api://<client-id>, ou le client-id)
//   ENTRA_REQUIRED_ROLE  : nom du rôle/scope admin requis (défaut: RoseAnnonce.Admin)

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const tenantId = process.env.ENTRA_TENANT_ID;
const audience = process.env.ENTRA_API_AUDIENCE;
const requiredRole = process.env.ENTRA_REQUIRED_ROLE || "RoseAnnonce.Admin";

// JWKS mis en cache entre les requêtes (jose gère le cache/rotation des clés).
let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(
      new URL(`https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`)
    );
  }
  return jwksCache;
}

// Accepte les jetons v2.0 et v1.0 (selon accessTokenAcceptedVersion de l'app).
function issuersAcceptes(): string[] {
  return [
    `https://login.microsoftonline.com/${tenantId}/v2.0`,
    `https://sts.windows.net/${tenantId}/`,
  ];
}

// Accepte l'audience avec OU sans le préfixe "api://". Les jetons v2.0 portent
// souvent le GUID seul (ex. 7800...8f9) tandis que les jetons v1.0 portent la
// forme api://<guid>. On tolère les deux pour éviter un rejet d'audience.
function audiencesAcceptees(): string[] {
  if (!audience) return [];
  const set = new Set<string>([audience]);
  if (audience.startsWith("api://")) set.add(audience.slice("api://".length));
  else set.add(`api://${audience}`);
  return [...set];
}

export type ResultatAuth =
  | { ok: true; claims: JWTPayload }
  | { ok: false; status: number; code: string; message: string };

export async function verifierAdminEntra(request: Request): Promise<ResultatAuth> {
  if (!tenantId || !audience) {
    return {
      ok: false,
      status: 503,
      code: "config_manquante",
      message: "Authentification Entra non configurée sur le serveur.",
    };
  }

  const header = request.headers.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (!token || scheme?.toLowerCase() !== "bearer") {
    return { ok: false, status: 401, code: "jeton_manquant", message: "Jeton Bearer manquant." };
  }

  let payload: JWTPayload;
  try {
    const res = await jwtVerify(token, getJwks(), {
      issuer: issuersAcceptes(),
      audience: audiencesAcceptees(),
    });
    payload = res.payload;
  } catch {
    return { ok: false, status: 401, code: "jeton_invalide", message: "Jeton invalide ou expiré." };
  }

  // Autorisation : rôle admin requis (claim "roles"), ou scope (claim "scp") en secours.
  const roles = Array.isArray(payload.roles) ? (payload.roles as string[]) : [];
  const scopes = typeof payload.scp === "string" ? payload.scp.split(" ") : [];
  const autorise = roles.includes(requiredRole) || scopes.includes(requiredRole);
  if (!autorise) {
    return { ok: false, status: 403, code: "role_requis", message: "Rôle administrateur requis." };
  }

  return { ok: true, claims: payload };
}

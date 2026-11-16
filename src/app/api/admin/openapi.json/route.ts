// Définition OpenAPI 2.0 (Swagger) de l'API admin, à importer dans un
// Custom Connector Power Platform. Le format 2.0 est celui nativement
// supporté par Power Apps/Power Automate (l'OpenAPI 3.0 y est mal pris en charge).
//
// Les URLs OAuth2 (Entra ID) et le host sont remplis dynamiquement depuis les
// variables d'environnement et l'hôte de la requête.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const tenantId = process.env.ENTRA_TENANT_ID || "VOTRE_TENANT_ID";
  const audience = process.env.ENTRA_API_AUDIENCE || "api://VOTRE_CLIENT_ID";
  const scope = `${audience}/.default`;
  const host = new URL(request.url).host;

  const userProps = {
    id: { type: "string" },
    email: { type: "string" },
    telephone: { type: "string" },
    role: { type: "string", enum: ["CLIENT", "PRO", "ADMIN"] },
    statut: { type: "string", enum: ["ACTIF", "SUSPENDU", "SUPPRIME"] },
    niveauVerification: { type: "integer" },
    telephoneVerifie: { type: "boolean" },
    emailVerifie: { type: "boolean" },
    identiteVerifiee: { type: "boolean" },
    selfieVerifie: { type: "boolean" },
    locale: { type: "string" },
    codeParrainage: { type: "string" },
    doitChangerMotDePasse: { type: "boolean" },
    paysId: { type: "string" },
    derniereActivite: { type: "string", format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  };

  const swagger = {
    swagger: "2.0",
    info: {
      title: "RoseAnnonce — API Admin Utilisateurs",
      description:
        "API privée réservée à l'application d'administration Power Apps. Gestion des utilisateurs (lecture, recherche, création, modification, suppression). Authentification Microsoft Entra ID (OAuth2) requise sur chaque requête.",
      version: "1.0.0",
    },
    host,
    basePath: "/api/admin",
    schemes: ["https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    securityDefinitions: {
      entra_oauth2: {
        type: "oauth2",
        flow: "accessCode",
        authorizationUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`,
        tokenUrl: `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        scopes: {
          [scope]: "Accès administrateur à l'API utilisateurs",
        },
      },
    },
    security: [{ entra_oauth2: [scope] }],
    paths: {
      "/users": {
        get: {
          operationId: "ListerUtilisateurs",
          summary: "Liste paginée des utilisateurs (recherche + filtres)",
          parameters: [
            { name: "page", in: "query", type: "integer", required: false, default: 1 },
            { name: "limit", in: "query", type: "integer", required: false, default: 20 },
            { name: "q", in: "query", type: "string", required: false, description: "Recherche email/téléphone/pseudo/code" },
            { name: "role", in: "query", type: "string", enum: ["CLIENT", "PRO", "ADMIN"], required: false },
            { name: "statut", in: "query", type: "string", enum: ["ACTIF", "SUSPENDU", "SUPPRIME"], required: false },
          ],
          responses: {
            "200": { description: "OK", schema: { $ref: "#/definitions/ListeUtilisateurs" } },
            "401": { description: "Non authentifié" },
            "403": { description: "Rôle admin requis" },
          },
        },
        post: {
          operationId: "CreerUtilisateur",
          summary: "Créer un utilisateur",
          parameters: [
            { name: "body", in: "body", required: true, schema: { $ref: "#/definitions/CreationUtilisateur" } },
          ],
          responses: {
            "201": { description: "Créé", schema: { $ref: "#/definitions/Utilisateur" } },
            "400": { description: "Données invalides" },
            "409": { description: "E-mail ou téléphone déjà utilisé" },
          },
        },
      },
      "/users/{id}": {
        get: {
          operationId: "ObtenirUtilisateur",
          summary: "Consulter un utilisateur",
          parameters: [{ name: "id", in: "path", required: true, type: "string" }],
          responses: {
            "200": { description: "OK", schema: { $ref: "#/definitions/Utilisateur" } },
            "404": { description: "Introuvable" },
          },
        },
        patch: {
          operationId: "ModifierUtilisateur",
          summary: "Modifier un utilisateur",
          parameters: [
            { name: "id", in: "path", required: true, type: "string" },
            { name: "body", in: "body", required: true, schema: { $ref: "#/definitions/ModificationUtilisateur" } },
          ],
          responses: {
            "200": { description: "Modifié", schema: { $ref: "#/definitions/Utilisateur" } },
            "400": { description: "Données invalides" },
            "404": { description: "Introuvable" },
            "409": { description: "Conflit (email/téléphone)" },
          },
        },
        delete: {
          operationId: "SupprimerUtilisateur",
          summary: "Supprimer un utilisateur (soft-delete : statut SUPPRIME)",
          parameters: [{ name: "id", in: "path", required: true, type: "string" }],
          responses: {
            "200": { description: "Supprimé (statut SUPPRIME)" },
            "404": { description: "Introuvable" },
          },
        },
      },
    },
    definitions: {
      Utilisateur: { type: "object", properties: userProps },
      ListeUtilisateurs: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/definitions/Utilisateur" } },
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
      },
      CreationUtilisateur: {
        type: "object",
        required: ["paysId"],
        properties: {
          email: { type: "string" },
          telephone: { type: "string" },
          password: { type: "string" },
          role: { type: "string", enum: ["CLIENT", "PRO", "ADMIN"], default: "CLIENT" },
          statut: { type: "string", enum: ["ACTIF", "SUSPENDU", "SUPPRIME"], default: "ACTIF" },
          locale: { type: "string", default: "fr" },
          paysId: { type: "string" },
        },
      },
      ModificationUtilisateur: {
        type: "object",
        properties: {
          email: { type: "string" },
          telephone: { type: "string" },
          password: { type: "string" },
          role: { type: "string", enum: ["CLIENT", "PRO", "ADMIN"] },
          statut: { type: "string", enum: ["ACTIF", "SUSPENDU", "SUPPRIME"] },
          locale: { type: "string" },
          telephoneVerifie: { type: "boolean" },
          emailVerifie: { type: "boolean" },
          identiteVerifiee: { type: "boolean" },
          selfieVerifie: { type: "boolean" },
          doitChangerMotDePasse: { type: "boolean" },
        },
      },
    },
  };

  return NextResponse.json(swagger);
}

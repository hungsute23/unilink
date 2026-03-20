/**
 * Appwrite Server SDK (Server-side only)
 *
 * Protected by `server-only` — this module will throw a build-time error
 * if accidentally imported in a Client Component.
 *
 * Two factory functions are exported:
 *  - createSessionClient()  → uses the logged-in user's session cookie (SSR auth)
 *  - createAdminClient()    → uses the server-side API key (admin/privileged ops)
 */

import "server-only";

import { cookies } from "next/headers";
import { Account, Client, Databases, Storage, Users } from "node-appwrite";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// ─── Session Client (User-scoped) ─────────────────────────────────────────────

/**
 * Creates an Appwrite client authenticated as the **current user**.
 * Reads the Appwrite session cookie from the incoming request.
 *
 * Use inside Server Components, Server Actions, and Route Handlers.
 */
export async function createSessionClient() {
  const endpoint = getRequiredEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  const projectId = getRequiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");

  const client = new Client().setEndpoint(endpoint).setProject(projectId);

  // Appwrite session cookies are prefixed with `a_session_`
  const cookieStore = await cookies();
  const sessionCookie = cookieStore
    .getAll()
    .find((c) => c.name.startsWith("a_session_"));

  if (!sessionCookie?.value) {
    throw new Error("No active Appwrite session found.");
  }

  client.setSession(sessionCookie.value);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

// ─── Admin Client (API-key scoped) ────────────────────────────────────────────

/**
 * Creates an Appwrite client authenticated with the **server-side API key**.
 * Has elevated privileges — use only in trusted server contexts.
 *
 * Use inside Server Actions, Route Handlers, or cron jobs.
 * NEVER expose this client or its results directly to the browser.
 */
export async function createAdminClient() {
  const endpoint = getRequiredEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  const projectId = getRequiredEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
  const apiKey = getRequiredEnv("APPWRITE_API_KEY");

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client), // Admin-only: manage all users
  };
}

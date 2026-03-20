/**
 * Appwrite Browser SDK (Client-side)
 *
 * Use this in Client Components ("use client") — never import server.ts here.
 * This creates a singleton Appwrite client scoped to the user's browser session.
 */

import { Account, Client, Databases, Storage } from "appwrite";

function createBrowserClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  if (!endpoint || !projectId) {
    throw new Error(
      "Missing Appwrite environment variables: NEXT_PUBLIC_APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_PROJECT_ID"
    );
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

// Singleton — reuse the same client across the browser session
let browserClientSingleton: ReturnType<typeof createBrowserClient> | null =
  null;

export function getBrowserClient() {
  if (!browserClientSingleton) {
    browserClientSingleton = createBrowserClient();
  }
  return browserClientSingleton;
}

export const { account, databases, storage } = getBrowserClient();

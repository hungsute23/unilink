import { createSessionClient } from "@/lib/appwrite/server";
import { Models } from "node-appwrite";

/**
 * Returns the currently authenticated Appwrite User.
 * Uses the session cookie automatically via `createSessionClient`.
 * Returns null if no active session or invalid session.
 */
export async function getLoggedInUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return user;
  } catch (error) {
    // Expected behavior when unauthenticated
    return null;
  }
}

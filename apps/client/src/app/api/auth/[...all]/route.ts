import { auth } from "@vt/auth/server";
import { toNextJsHandler } from "better-auth/next-js";

// Use the same Better Auth instance - this will create cookies on localhost:3002
export const { GET, POST } = toNextJsHandler(auth);

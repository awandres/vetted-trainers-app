// Auth Package - Better Auth configuration for Vetted Trainers

export { auth, isAdmin, isTrainer, isMember } from "./server";
export type { Session, User, UserRole } from "./server";
export { authClient, signIn, signUp, signOut, useSession, getSession } from "./client";

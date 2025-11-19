// src/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/config";

export function auth() {
  return getServerSession(authOptions);
}

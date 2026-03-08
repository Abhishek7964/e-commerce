// src/components/SessionProvider.js
// NextAuth's <SessionProvider> needs to run on the CLIENT.
// We can't put 'use client' directly in layout.js (it's a Server Component),
// so we wrap it in this tiny client component instead.

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({ children }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}

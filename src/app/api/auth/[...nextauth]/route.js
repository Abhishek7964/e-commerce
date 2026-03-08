// src/app/api/auth/[...nextauth]/route.js
// This single file handles ALL NextAuth endpoints:
//   GET  /api/auth/session
//   GET  /api/auth/providers
//   POST /api/auth/signin/credentials
//   POST /api/auth/signout
//   ...and more

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// App Router requires named exports for each HTTP method
export { handler as GET, handler as POST };

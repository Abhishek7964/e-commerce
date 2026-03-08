// lib/auth.js
// Central NextAuth configuration with user storage system

import CredentialsProvider from "next-auth/providers/credentials";
import { findUserByEmail } from "./users";

export const authOptions = {
  // Use JWT-based sessions (no DB required for sessions)
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },

  // Where NextAuth should redirect on login/error
  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      // These fields appear on NextAuth's built-in form (not used here
      // since we have a custom /login page, but required by the type)
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // authorize() runs on the SERVER — safe to query DB here
      async authorize(credentials) {
        console.log("🔐 authorize called with:", { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing email or password");
          throw new Error("Email and password are required");
        }

        // Trim and normalize email (case-insensitive)
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;
        
        console.log("🔍 Looking for user with email:", email);

        // Look up user from the user storage system
        const user = findUserByEmail(email);
        console.log("👤 User found:", user ? `${user.name} (${user.email})` : "NOT FOUND");

        if (!user) {
          console.log("❌ User not found for email:", email);
          throw new Error("Invalid email or password");
        }

        console.log("🔐 Checking password... (provided length: ${password.length}, stored length: ${user.password.length})");

        // Verify password (in production, use bcrypt comparison)
        if (user.password !== password) {
          console.log("❌ Password mismatch for:", email);
          console.log("   Provided:", password);
          console.log("   Stored:", user.password);
          throw new Error("Invalid email or password");
        }

        console.log("✅ Authentication successful for:", email);

        // Return user data (becomes `token.user` in the jwt callback)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    // 1️⃣  Runs when JWT is created or updated
    //     Attach extra fields (role, id) so they travel with the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // 2️⃣  Runs every time session is accessed (server or client)
    //     Expose only what the client should see
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  // Only needed in development if NEXTAUTH_SECRET isn't set
  secret: process.env.NEXTAUTH_SECRET,
};

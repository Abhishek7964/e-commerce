// src/app/layout.js
// ROOT LAYOUT — Server Component
// Wraps the entire app. We inject SessionProvider here so every
// child page can access the session via useSession() or getServerSession().

import SessionProvider from "@/component/SessionProvider";
import "./globals.css";

export const metadata = {
  title: "Next.js Auth POC",
  description: "Login / Logout with NextAuth.js and App Router",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/*
          SessionProvider is a Client Component wrapper.
          It makes the session available app-wide:
            - Client components  → useSession()
            - Server components  → getServerSession(authOptions)
        */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

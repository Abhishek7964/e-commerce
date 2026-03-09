// src/app/layout.js  ← update this file
// Add SnackbarProvider alongside your existing SessionProvider

import SessionProvider from "@/component/SessionProvider";
import { SnackbarProvider } from "@/context/SnackbarContext";
import { WishlistProvider } from "@/context/WishlistContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <SnackbarProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </SnackbarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

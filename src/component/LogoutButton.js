"use client";

import { signOut } from "next-auth/react";
import { useSnackbar } from "@/context/SnackbarContext";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const { showSnackbar } = useSnackbar();

  const handleLogout = async () => {
    showSnackbar("👋 Logged out successfully. See you soon!", "info");
    // Small delay so snackbar is visible before redirect
    await new Promise((r) => setTimeout(r, 800));
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button onClick={handleLogout} className={styles.button}>
      Logout
    </button>
  );
}

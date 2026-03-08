"use client";

import { signOut } from "next-auth/react";
import styles from "./LogoutButton.module.css";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button onClick={handleLogout} className={styles.button}>
      Logout
    </button>
  );
}

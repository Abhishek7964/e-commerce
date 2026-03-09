"use client";

import { useEffect, useRef } from "react";
import styles from "./Snackbar.module.css";

const ICONS = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

export default function Snackbar({
  open,
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (open) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [open, duration, onClose]);

  return (
    <div
      className={`${styles.snackbar} ${styles[type]} ${open ? styles.show : styles.hide}`}
    >
      <span className={styles.icon}>{ICONS[type]}</span>
      <span className={styles.message}>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}

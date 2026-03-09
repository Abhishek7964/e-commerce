"use client";

import { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@/component/Snackbar";

const SnackbarContext = createContext(null);

export function SnackbarProvider({ children }) {
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const showSnackbar = useCallback((message, type = "success") => {
    setSnack({ open: true, message, type });
  }, []);

  const hideSnackbar = useCallback(() => {
    setSnack((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={hideSnackbar}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx)
    throw new Error("useSnackbar must be used inside <SnackbarProvider>");
  return ctx;
}

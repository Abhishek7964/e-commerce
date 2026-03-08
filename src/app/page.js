"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session) {
      // User is logged in, redirect to products
      router.push("/products");
    } else {
      // User is not logged in, redirect to login
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <p
        style={{
          fontSize: "20px",
          color: "white",
          fontWeight: "600",
        }}
      >
        Loading...
      </p>
    </div>
  );
}

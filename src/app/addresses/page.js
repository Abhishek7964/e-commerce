import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/component/LogoutButton";
import styles from "./Addresses.module.css";

export const metadata = {
  title: "My Addresses",
};

export default async function AddressesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/addresses");
  }

  return (
    <div className={styles.wrapper}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/dashboard" className={styles.logo}>🛍️ ShopHub</Link>
          <div className={styles.navRight}>
            <span className={styles.userName}>👤 {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>📍 Saved Addresses</h1>
          <p>Manage your delivery addresses</p>
        </div>

        <div className={styles.content}>
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🏠</p>
            <h2>No addresses saved yet</h2>
            <p>Add an address to make checkout faster</p>
            <button className={styles.ctaButton}>
              ➕ Add New Address
            </button>
          </div>
        </div>

        <div className={styles.info}>
          <p>💡 <strong>Tip:</strong> Save multiple addresses for faster checkout on your next purchase.</p>
        </div>

        <div className={styles.backLink}>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

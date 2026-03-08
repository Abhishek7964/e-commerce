import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/component/LogoutButton";
import styles from "./Wishlist.module.css";

export const metadata = {
  title: "My Wishlist",
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/wishlist");
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
          <h1>❤️ My Wishlist</h1>
          <p>Save your favorite items for later</p>
        </div>

        <div className={styles.content}>
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>💝</p>
            <h2>Your wishlist is empty</h2>
            <p>Items you add to your wishlist will appear here</p>
            <Link href="/products" className={styles.ctaButton}>
              ➔ Continue Shopping
            </Link>
          </div>
        </div>

        <div className={styles.backLink}>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

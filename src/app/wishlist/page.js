"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useSnackbar } from "@/context/SnackbarContext";
import LogoutButton from "@/component/LogoutButton";
import styles from "./Wishlist.module.css";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading wishlist...</p>
      </div>
    );
  }

  if (!session) return null;

  const handleRemove = (product) => {
    removeFromWishlist(product.id);
    showSnackbar(`💔 "${product.name}" removed from wishlist.`, "warning");
  };

  return (
    <div className={styles.wrapper}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/dashboard" className={styles.logo}>
            🛍️ ShopHub
          </Link>
          <div className={styles.navRight}>
            <span className={styles.userName}>👤 {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <h1>❤️ My Wishlist</h1>
            <p>
              {wishlist.length > 0
                ? `${wishlist.length} item${wishlist.length > 1 ? "s" : ""} saved`
                : "Save your favorite items for later"}
            </p>
          </div>
          {wishlist.length > 0 && (
            <Link href="/products" className={styles.addMoreBtn}>
              + Add More Items
            </Link>
          )}
        </div>

        {/* EMPTY STATE */}
        {wishlist.length === 0 ? (
          <div className={styles.content}>
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>💝</p>
              <h2>Your wishlist is empty</h2>
              <p>
                Browse products and tap the ❤️ button on any product page to
                save items you love.
              </p>
              <Link href="/products" className={styles.ctaButton}>
                ➔ Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlist.map((product) => (
              <div key={product.id} className={styles.card}>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(product)}
                  title="Remove from wishlist"
                >
                  ✕
                </button>

                <Link
                  href={`/products/${product.id}`}
                  className={styles.imageLink}
                >
                  <div className={styles.imageWrap}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.image}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </Link>

                <div className={styles.cardInfo}>
                  <span className={styles.category}>{product.category}</span>
                  <Link
                    href={`/products/${product.id}`}
                    className={styles.nameLink}
                  >
                    <h3 className={styles.name}>{product.name}</h3>
                  </Link>

                  <div className={styles.ratingRow}>
                    <div className={styles.stars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={
                            s <= Math.round(product.rating)
                              ? styles.starFilled
                              : styles.starEmpty
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className={styles.ratingText}>
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    <span className={styles.originalPrice}>
                      ₹{Math.round(product.price * 1.2).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <Link
                    href={`/products/${product.id}`}
                    className={styles.viewBtn}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.backLink}>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

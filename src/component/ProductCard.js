"use client";

import { useState } from "react";
import Link from "next/link";
import { useSnackbar } from "@/context/SnackbarContext";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, onAddToCart }) {
  const [isAdded, setIsAdded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleAddToCart = (e) => {
    e?.stopPropagation();
    setIsAdded(true);
    onAddToCart?.();
    showSnackbar(`🛒 "${product.name}" added to cart!`, "success");
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <img
            src={product.image}
            alt={product.name}
            className={styles.image}
            referrerPolicy="no-referrer"
          />
          <div className={styles.badge}>{product.category}</div>
          <div className={styles.overlay}>
            <button
              className={styles.viewBtn}
              onClick={() => setShowModal(true)}
            >
              Quick View
            </button>
            <Link href={`/products/${product.id}`} className={styles.detailBtn}>
              View Details
            </Link>
          </div>
        </div>

        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.rating}>
            <div className={styles.stars}>
              {"⭐".repeat(Math.floor(product.rating))}
              {product.rating % 1 !== 0 && "✨"}
            </div>
            <span className={styles.ratingText}>
              {product.rating} ({product.reviews})
            </span>
          </div>

          <div className={styles.footer}>
            <span className={styles.price}>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            <button
              className={`${styles.button} ${isAdded ? styles.added : ""}`}
              onClick={handleAddToCart}
            >
              {isAdded ? "✓ Added" : "🛒 Add"}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {showModal && (
        <div className={styles.modal} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <div className={styles.modalGrid}>
              <div className={styles.modalImage}>
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className={styles.modalInfo}>
                <h2>{product.name}</h2>
                <p className={styles.category}>Category: {product.category}</p>

                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {"⭐".repeat(Math.floor(product.rating))}
                  </span>
                  <span className={styles.ratingText}>
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>

                <p className={styles.modalDescription}>{product.description}</p>

                <div className={styles.modalPrice}>
                  Price:{" "}
                  <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                </div>

                <div className={styles.modalActions}>
                  <button
                    className={styles.addBtn}
                    onClick={() => {
                      handleAddToCart();
                      setShowModal(false);
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className={styles.detailLink}
                    onClick={() => setShowModal(false)}
                  >
                    View Full Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

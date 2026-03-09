"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useWishlist } from "@/context/WishlistContext";
import Link from "next/link";
import { getProductById, getAllProducts } from "@/lib/products";
import { useSnackbar } from "@/context/SnackbarContext";
import styles from "./ProductDetail.module.css";

// ── Helpers ────────────────────────────────────────────────────────────────

// Generate fake reviews for demo
const generateReviews = (productId, rating) => {
  const names = [
    "Rahul M.",
    "Priya S.",
    "Amit K.",
    "Sneha R.",
    "Vikram D.",
    "Anjali P.",
    "Rohit T.",
    "Meera L.",
  ];
  const comments = [
    "Absolutely love this product! Exceeded my expectations in every way.",
    "Great quality for the price. Would definitely recommend to friends.",
    "Solid build quality, fast delivery. Very satisfied with the purchase.",
    "Works perfectly. Setup was easy and performance is top-notch.",
    "Good product overall. Packaging was great and delivery was quick.",
    "Exactly as described. Happy with the purchase, will buy again.",
    "Impressive quality. The product feels premium and works flawlessly.",
    "Decent product. Does what it says. Good value for money.",
  ];
  const count = 4 + (productId % 4);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[(productId + i) % names.length],
    rating: Math.max(3, Math.min(5, Math.round(rating + (i % 3) - 1))),
    comment: comments[(productId + i) % comments.length],
    date: new Date(2026, (productId + i) % 12, (i + 1) * 5).toLocaleDateString(
      "en-IN",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    ),
    verified: i % 3 !== 0,
  }));
};

// Fake specs based on category
const getSpecs = (product) => {
  const base = {
    Brand: "ShopHub",
    Model: `SH-${product.id}00X`,
    Warranty: "1 Year",
  };
  const map = {
    Electronics: {
      ...base,
      Connectivity: "Wireless / USB",
      "Battery Life": "20+ hours",
      Weight: "250g",
      Color: "Matte Black",
    },
    Accessories: {
      ...base,
      Material: "Premium Aluminium",
      Compatibility: "Universal",
      Dimensions: "30 × 15 × 5 cm",
      Weight: "180g",
    },
    Storage: {
      ...base,
      Interface: "USB 3.1 Gen 2",
      "Read Speed": "550 MB/s",
      "Write Speed": "500 MB/s",
      Capacity: product.name,
    },
    Office: {
      ...base,
      Material: "Steel + ABS Plastic",
      "Load Capacity": "15 kg",
      Adjustable: "Yes",
      Assembly: "Easy setup",
    },
    Home: {
      ...base,
      "Power Source": "AC / Battery",
      Connectivity: "Wi-Fi 2.4GHz + 5GHz",
      "App Support": "iOS & Android",
      Voltage: "220V",
    },
    Gaming: {
      ...base,
      DPI: "100–16000",
      "Polling Rate": "1000Hz",
      "RGB Lighting": "16.8M colors",
      "Switch Life": "50M clicks",
    },
    Audio: {
      ...base,
      "Frequency Response": "20Hz–20kHz",
      Impedance: "32Ω",
      "Driver Size": "40mm",
      "Cable Length": "1.2m",
    },
    Photography: {
      ...base,
      "Mount Type": 'Universal 1/4"',
      "Max Load": "5 kg",
      Material: "Aluminium alloy",
      Foldable: "Yes",
    },
  };
  return map[product.category] || base;
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { showSnackbar } = useSnackbar();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const { toggleWishlist, isWishlisted: checkWishlisted } = useWishlist();
  const isWishlisted = checkWishlisted(product?.id);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    const id = parseInt(params.id);
    const found = getProductById(id);
    if (!found) {
      router.push("/products");
      return;
    }

    setProduct(found);
    setReviews(generateReviews(id, found.rating));

    // Related: same category, exclude self
    const all = getAllProducts();
    const rel = all
      .filter((p) => p.category === found.category && p.id !== id)
      .slice(0, 4);
    setRelated(rel);
  }, [params.id, router]);

  if (status === "loading" || !product) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading product...</p>
      </div>
    );
  }

  // Fake multiple images by applying slight variations
  const images = [
    product.image,
    product.image + "&sat=-20",
    product.image + "&brightness=10",
    product.image + "&contrast=10",
  ];

  const specs = getSpecs(product);

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round(
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
    ),
  }));

  const handleAddToCart = () => {
    showSnackbar(
      `🛒 "${product.name}" × ${quantity} added to cart!`,
      "success",
    );
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    showSnackbar(
      isWishlisted
        ? `💔 Removed from wishlist`
        : `❤️ "${product.name}" added to wishlist!`,
      isWishlisted ? "warning" : "success",
    );
  };

  const handleReviewSubmit = () => {
    if (!userRating) {
      showSnackbar("Please select a star rating.", "error");
      return;
    }
    if (!reviewText.trim()) {
      showSnackbar("Please write a review.", "error");
      return;
    }
    const newReview = {
      id: reviews.length + 1,
      name: session.user.name || "You",
      rating: userRating,
      comment: reviewText.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      verified: true,
    };
    setReviews((prev) => [newReview, ...prev]);
    setUserRating(0);
    setReviewText("");
    showSnackbar("⭐ Review submitted! Thank you.", "success");
  };

  return (
    <div className={styles.wrapper}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/products" className={styles.logo}>
            🛍️ ShopHub
          </Link>
          <div className={styles.breadcrumb}>
            <Link href="/products">Products</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category}`}>
              {product.category}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          <div className={styles.navActions}>
            <button className={styles.backBtn} onClick={() => router.back()}>
              ← Back
            </button>
          </div>
        </div>
      </nav>

      {/* ── MAIN DETAIL ── */}
      <div className={styles.container}>
        <div className={styles.detailGrid}>
          {/* LEFT — Image Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <img
                src={images[activeImage]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className={styles.mainImg}
              />
              <span className={styles.categoryTag}>{product.category}</span>
              <button
                className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlisted : ""}`}
                onClick={handleWishlist}
              >
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            </div>

            <div className={styles.thumbnails}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImage === i ? styles.activeThumb : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Product Info */}
          <div className={styles.info}>
            {/* Title & Rating */}
            <div className={styles.infoTop}>
              <span className={styles.infoCategory}>{product.category}</span>
              <h1 className={styles.productName}>{product.name}</h1>

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
                <span className={styles.ratingNum}>{product.rating}</span>
                <span className={styles.reviewCount}>
                  ({product.reviews} reviews)
                </span>
                <span className={styles.inStock}>✅ In Stock</span>
              </div>
            </div>

            {/* Price */}
            <div className={styles.priceBlock}>
              <span className={styles.price}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className={styles.originalPrice}>
                ₹{Math.round(product.price * 1.2).toLocaleString("en-IN")}
              </span>
              <span className={styles.discount}>20% OFF</span>
            </div>

            {/* Description */}
            <p className={styles.shortDesc}>{product.description}</p>

            {/* Highlights */}
            <div className={styles.highlights}>
              <div className={styles.highlight}>
                <span>🚚</span>
                <span>Free delivery above ₹499</span>
              </div>
              <div className={styles.highlight}>
                <span>↩️</span>
                <span>10-day easy returns</span>
              </div>
              <div className={styles.highlight}>
                <span>🛡️</span>
                <span>1 Year manufacturer warranty</span>
              </div>
              <div className={styles.highlight}>
                <span>✅</span>
                <span>100% genuine product</span>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className={styles.actions}>
              <div className={styles.qtyControl}>
                <span className={styles.qtyLabel}>Qty</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span className={styles.qtyValue}>{quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                >
                  +
                </button>
              </div>

              <button className={styles.addCartBtn} onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>

              <button
                className={styles.buyNowBtn}
                onClick={() => {
                  handleAddToCart();
                  router.push("/products");
                }}
              >
                ⚡ Buy Now
              </button>
            </div>

            {/* Total */}
            {quantity > 1 && (
              <p className={styles.totalLine}>
                Total:{" "}
                <strong>
                  ₹{(product.price * quantity).toLocaleString("en-IN")}
                </strong>
              </p>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className={styles.tabs}>
          <div className={styles.tabBar}>
            {["description", "specs", "reviews"].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTab : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "description" && "📄 Description"}
                {tab === "specs" && "🔧 Specifications"}
                {tab === "reviews" && `⭐ Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className={styles.tabContent}>
              <h3>About {product.name}</h3>
              <p>{product.description}</p>
              <p>
                This premium {product.category.toLowerCase()} product is
                designed for everyday use and professional environments alike.
                Built with high-quality materials and engineered to deliver
                exceptional performance, it is a reliable addition to your
                setup.
              </p>
              <h4>What's in the Box</h4>
              <ul className={styles.boxList}>
                <li>1× {product.name}</li>
                <li>1× User Manual</li>
                <li>1× Warranty Card</li>
                <li>1× USB Cable / Adapter (where applicable)</li>
              </ul>
            </div>
          )}

          {/* Specs Tab */}
          {activeTab === "specs" && (
            <div className={styles.tabContent}>
              <h3>Technical Specifications</h3>
              <table className={styles.specsTable}>
                <tbody>
                  {Object.entries(specs).map(([key, val]) => (
                    <tr key={key}>
                      <td className={styles.specKey}>{key}</td>
                      <td className={styles.specVal}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className={styles.tabContent}>
              <div className={styles.reviewsLayout}>
                {/* Rating Summary */}
                <div className={styles.ratingSummary}>
                  <div className={styles.bigRating}>{product.rating}</div>
                  <div className={styles.bigStars}>
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
                  <p className={styles.totalReviews}>
                    {reviews.length} reviews
                  </p>
                  <div className={styles.breakdown}>
                    {ratingBreakdown.map(({ star, count, pct }) => (
                      <div key={star} className={styles.breakdownRow}>
                        <span className={styles.breakdownStar}>{star}★</span>
                        <div className={styles.breakdownBar}>
                          <div
                            className={styles.breakdownFill}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={styles.breakdownCount}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews List + Write Review */}
                <div className={styles.reviewsRight}>
                  {/* Write a Review */}
                  <div className={styles.writeReview}>
                    <h4>Write a Review</h4>
                    <div className={styles.starPicker}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          className={`${styles.starPickBtn} ${s <= (hoverRating || userRating) ? styles.starPickActive : ""}`}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(s)}
                        >
                          ★
                        </button>
                      ))}
                      {userRating > 0 && (
                        <span className={styles.ratingLabel}>
                          {
                            [
                              "",
                              "Poor",
                              "Fair",
                              "Good",
                              "Very Good",
                              "Excellent",
                            ][userRating]
                          }
                        </span>
                      )}
                    </div>
                    <textarea
                      className={styles.reviewInput}
                      placeholder="Share your experience with this product..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={4}
                    />
                    <button
                      className={styles.submitReview}
                      onClick={handleReviewSubmit}
                    >
                      Submit Review
                    </button>
                  </div>

                  {/* Reviews List */}
                  <div className={styles.reviewsList}>
                    {reviews.map((r) => (
                      <div key={r.id} className={styles.reviewCard}>
                        <div className={styles.reviewHeader}>
                          <div className={styles.reviewAvatar}>
                            {r.name.charAt(0)}
                          </div>
                          <div className={styles.reviewMeta}>
                            <span className={styles.reviewName}>{r.name}</span>
                            {r.verified && (
                              <span className={styles.verifiedBadge}>
                                ✅ Verified
                              </span>
                            )}
                            <span className={styles.reviewDate}>{r.date}</span>
                          </div>
                          <div className={styles.reviewStars}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                className={
                                  s <= r.rating
                                    ? styles.starFilled
                                    : styles.starEmpty
                                }
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className={styles.reviewComment}>{r.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <section className={styles.related}>
            <h2 className={styles.relatedTitle}>🛍️ Related Products</h2>
            <div className={styles.relatedGrid}>
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.relatedImage}>
                    <img
                      src={p.image}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={styles.relatedInfo}>
                    <p className={styles.relatedName}>{p.name}</p>
                    <div className={styles.relatedStars}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={
                            s <= Math.round(p.rating)
                              ? styles.starFilled
                              : styles.starEmpty
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span className={styles.relatedRating}>{p.rating}</span>
                    </div>
                    <p className={styles.relatedPrice}>
                      ₹{p.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAllProducts, searchProducts } from "@/lib/products";
import ProductCard from "@/component/ProductCard";
import styles from "./Products.module.css";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const allProducts = getAllProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    setLoading(false);
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== "All") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchTerm.trim()) {
      const searched = searchProducts(searchTerm);
      result = result.filter((product) =>
        searched.some((p) => p.id === product.id)
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  const handleAddToCart = (product) => {
    setCartItems([...cartItems, product]);
    setCartCount(cartCount + 1);
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        alert("✅ Order placed successfully! Your order has been added to your dashboard.");
        // Clear cart
        setCartItems([]);
        setCartCount(0);
        setShowCart(false);
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        alert("❌ " + (data.error || "Failed to place order"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("❌ Error placing order");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your store...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  return (
    <div className={styles.wrapper}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <div className={styles.logo}>🛍️ ShopHub</div>
          </div>

          <div className={styles.navCenter}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
            </div>
          </div>

          <div className={styles.navRight}>
            <button
              className={styles.dashboardBtn}
              onClick={() => router.push("/dashboard")}
              title="Back to Dashboard"
            >
              📊
            </button>

            <div className={styles.navItem} onClick={() => setShowCart(!showCart)}>
              <span className={styles.cartIcon}>🛒</span>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </div>

            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                👤 {session.user.name?.split(" ")[0] || session.user.email}
              </button>

              {showUserMenu && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.menuItem}>{session.user.email}</div>
                  <hr className={styles.divider} />
                  <button
                    className={styles.logoutBtn}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO BANNER */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Welcome to ShopHub</h1>
          <p className={styles.heroSubtitle}>
            Discover amazing products at unbeatable prices
          </p>
          <p className={styles.heroText}>Hi, {session.user.name || session.user.email}! 👋</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContainer}>
        {/* SIDEBAR FILTERS */}
        <aside className={styles.sidebar}>
          <div className={styles.filterCard}>
            <h3 className={styles.filterTitle}>🏷️ Categories</h3>
            <div className={styles.categoryList}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${styles.categoryBtn} ${
                    selectedCategory === category ? styles.active : ""
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterCard}>
            <h3 className={styles.filterTitle}>📊 Results</h3>
            <p className={styles.resultCount}>
              Showing <strong>{filteredProducts.length}</strong> of{" "}
              <strong>{products.length}</strong> products
            </p>
          </div>
        </aside>

        {/* PRODUCTS SECTION */}
        <section className={styles.productsSection}>
          {/* PRODUCTS HEADER */}
          <div className={styles.productsHeader}>
            <h2 className={styles.productsTitle}>
              {selectedCategory === "All" ? "All Products" : selectedCategory}
            </h2>
            <div className={styles.viewOptions}>
              <button 
                className={`${styles.viewBtn} ${viewMode === "grid" ? styles.active : ""}`}
                onClick={() => setViewMode("grid")}
              >
                Grid
              </button>
              <button 
                className={`${styles.viewBtn} ${viewMode === "list" ? styles.active : ""}`}
                onClick={() => setViewMode("list")}
              >
                List
              </button>
            </div>
          </div>

          {/* PRODUCTS GRID/LIST */}
          {filteredProducts.length > 0 ? (
            viewMode === "grid" ? (
              <div className={styles.productsGrid}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.productsList}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={styles.listItem}>
                    <div className={styles.listItemImage}>
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className={styles.listItemInfo}>
                      <h3 className={styles.listItemName}>{product.name}</h3>
                      <p className={styles.listItemDescription}>{product.description}</p>
                      <div className={styles.listItemMeta}>
                        <span className={styles.listItemCategory}>{product.category}</span>
                        <span className={styles.listItemRating}>⭐ {product.rating} ({product.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className={styles.listItemAction}>
                      <p className={styles.listItemPrice}>₹{product.price}</p>
                      <button 
                        className={styles.addToCartBtn}
                        onClick={() => handleAddToCart(product)}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>No Products Found</h3>
              <p>Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className={styles.resetBtn}
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h4>About ShopHub</h4>
            <p>Your one-stop destination for quality products.</p>
          </div>
          <div className={styles.footerColumn}>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#products">Products</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Customer Service</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#shipping">Shipping Info</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a href="#fb">Facebook</a>
              <a href="#tw">Twitter</a>
              <a href="#ig">Instagram</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2026 ShopHub. All rights reserved.</p>
        </div>
      </footer>

      {/* CART DRAWER */}
      {showCart && (
        <div className={styles.cartOverlay} onClick={() => setShowCart(false)}>
          <div className={styles.cartDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cartHeader}>
              <h2>🛒 Your Cart</h2>
              <button className={styles.closeCart} onClick={() => setShowCart(false)}>✕</button>
            </div>

            <div className={styles.cartContent}>
              {cartItems.length > 0 ? (
                <>
                  <div className={styles.cartItems}>
                    {cartItems.map((item, index) => (
                      <div key={index} className={styles.cartItem}>
                        <img src={item.image} alt={item.name} className={styles.cartItemImage} />
                        <div className={styles.cartItemInfo}>
                          <h4>{item.name}</h4>
                          <p className={styles.cartItemPrice}>₹{item.price}</p>
                        </div>
                        <button 
                          className={styles.removeBtn}
                          onClick={() => {
                            setCartItems(cartItems.filter((_, i) => i !== index));
                            setCartCount(cartCount - 1);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={styles.cartFooter}>
                    <div className={styles.cartTotal}>
                      Subtotal: <strong>₹{cartItems.reduce((sum, item) => sum + item.price, 0)}</strong>
                    </div>
                    <button className={styles.checkoutBtn} onClick={handleCheckout}>🔒 Proceed to Checkout</button>
                  </div>
                </>
              ) : (
                <div className={styles.emptyCart}>
                  <p className={styles.emptyCartIcon}>🛒</p>
                  <p className={styles.emptyCartText}>Your cart is empty</p>
                  <p className={styles.emptyCartSubtext}>Add items from the store to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

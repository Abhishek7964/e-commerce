// src/app/dashboard/page.js
// DASHBOARD — Server Component
// User dashboard with order history and quick navigation to shop

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/component/LogoutButton";
import { getOrdersByEmail } from "@/lib/orders";
import styles from "./Dashboard.module.css";

export const metadata = {
  title: "My Dashboard",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  // Fetch real orders from file
  const userOrders = getOrdersByEmail(session.user.email);
  const recentOrders = userOrders.slice(-3).reverse(); // Get last 3 orders, newest first
  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className={styles.wrapper}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>🛍️ ShopHub</div>
          <div className={styles.navRight}>
            <span className={styles.userName}>👤 {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className={styles.container}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Welcome back, {session.user.name}! 👋</h1>
            <p className={styles.subtitle}>Here's your shopping dashboard</p>
          </div>
          <Link href="/products" className={styles.ctaButton}>
            ➔ Continue Shopping
          </Link>
        </div>

        {/* QUICK STATS */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Orders Placed</p>
              <p className={styles.statValue}>{totalOrders}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Total Spent</p>
              <p className={styles.statValue}>₹{totalSpent}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>💎</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Member Since</p>
              <p className={styles.statValue}>2026</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>Points</p>
              <p className={styles.statValue}>529</p>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className={styles.contentGrid}>
          {/* RECENT ORDERS */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>📋 Recent Orders</h2>
              <Link href="#" className={styles.viewAllLink}>
                View All →
              </Link>
            </div>

            {recentOrders.length > 0 ? (
              <div className={styles.ordersTable}>
                <div className={styles.tableRow + " " + styles.tableHeader}>
                  <div className={styles.tableCell}>Order ID</div>
                  <div className={styles.tableCell}>Date</div>
                  <div className={styles.tableCell}>Items</div>
                  <div className={styles.tableCell}>Total</div>
                  <div className={styles.tableCell}>Status</div>
                </div>
                {recentOrders.map((order) => (
                  <div key={order.id} className={styles.tableRow}>
                    <div className={styles.tableCell}>
                      <span className={styles.orderId}>{order.id}</span>
                    </div>
                    <div className={styles.tableCell}>{order.date}</div>
                    <div className={styles.tableCell}>{order.items.length}</div>
                    <div className={styles.tableCell}>
                      <span className={styles.price}>₹{order.total}</span>
                    </div>
                    <div className={styles.tableCell}>
                      <span className={styles.badge}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p style={{fontSize: '18px', color: '#667eea', margin: 0}}>📭 No orders yet</p>
                <p style={{marginTop: '8px', margin: 0}}>Start shopping to place your first order!</p>
              </div>
            )}
          </section>

          {/* QUICK ACTIONS */}
          <aside className={styles.sidebar}>
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>⚡ Quick Actions</h3>
              <div className={styles.actionsList}>
                <Link href="/products" className={styles.actionItem}>
                  <span className={styles.actionIcon}>🛒</span>
                  <span className={styles.actionText}>Continue Shopping</span>
                </Link>
                <Link href="/wishlist" className={styles.actionItem}>
                  <span className={styles.actionIcon}>❤️</span>
                  <span className={styles.actionText}>My Wishlist</span>
                </Link>
                <Link href="/addresses" className={styles.actionItem}>
                  <span className={styles.actionIcon}>📍</span>
                  <span className={styles.actionText}>Addresses</span>
                </Link>
                <Link href="/security" className={styles.actionItem}>
                  <span className={styles.actionIcon}>🔐</span>
                  <span className={styles.actionText}>Security</span>
                </Link>
              </div>
            </section>

            {/* PROFILE INFO */}
            <section className={styles.sideSection}>
              <h3 className={styles.sideSectionTitle}>👤 Profile</h3>
              <div className={styles.profileInfo}>
                <div className={styles.profileField}>
                  <label>Name</label>
                  <p>{session.user.name}</p>
                </div>
                <div className={styles.profileField}>
                  <label>Email</label>
                  <p>{session.user.email}</p>
                </div>
                <button className={styles.editProfileBtn}>
                  ✏️ Edit Profile
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

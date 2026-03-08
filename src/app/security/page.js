import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/component/LogoutButton";
import styles from "./Security.module.css";

export const metadata = {
  title: "Security Settings",
};

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/security");
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
          <h1>🔐 Security Settings</h1>
          <p>Manage your account security</p>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h2>🔑 Password Management</h2>
            <p className={styles.sectionDesc}>Keep your account secure by using a strong password</p>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h3>Password</h3>
                <p>Last changed 3 months ago</p>
              </div>
              <button className={styles.actionButton}>Change Password</button>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <h2>📱 Active Sessions</h2>
            <p className={styles.sectionDesc}>Manage your active login sessions</p>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h3>Current Device</h3>
                <p>🖥️ Windows • Last active just now</p>
              </div>
              <span className={styles.badge}>Current</span>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.section}>
            <h2>⚡ Two-Factor Authentication</h2>
            <p className={styles.sectionDesc}>Add an extra layer of security to your account</p>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h3>2FA Status</h3>
                <p>Not enabled</p>
              </div>
              <button className={styles.actionButton}>Enable 2FA</button>
            </div>
          </div>
        </div>

        <div className={styles.info}>
          <p>🛡️ <strong>Security Tip:</strong> Review your security settings regularly and enable two-factor authentication for maximum protection.</p>
        </div>

        <div className={styles.backLink}>
          <Link href="/dashboard">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}

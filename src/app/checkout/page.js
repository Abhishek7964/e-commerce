"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSnackbar } from "@/context/SnackbarContext";
import styles from "./Checkout.module.css";

// ── Step indicator ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Address", icon: "📍" },
  { id: 2, label: "Payment", icon: "💳" },
  { id: 3, label: "Review", icon: "📋" },
  { id: 4, label: "Confirm", icon: "🎉" },
];

// ── Indian states ─────────────────────────────────────────────────────────
const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
];

// ── Helpers ───────────────────────────────────────────────────────────────
const generateOrderId = () =>
  "ORD-" +
  Date.now().toString().slice(-8) +
  Math.random().toString(36).slice(2, 5).toUpperCase();

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState("");

  // ── Step 1: Address ──
  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    pincode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    type: "Home",
  });
  const [addressErrors, setAddressErrors] = useState({});

  // ── Step 2: Payment ──
  const [paymentMethod, setPaymentMethod] = useState(""); // upi | card | cod | netbanking
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [bank, setBank] = useState("");
  const [paymentErrors, setPaymentErrors] = useState({});

  // ── Load cart from sessionStorage ──
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    try {
      const saved = sessionStorage.getItem("checkoutCart");
      if (saved) {
        setCartItems(JSON.parse(saved));
      } else {
        router.push("/products");
      }
    } catch {
      router.push("/products");
    }

    // Pre-fill name from session
    if (session?.user?.name) {
      setAddress((a) => ({ ...a, fullName: session.user.name }));
    }
  }, [status, session, router]);

  if (status === "loading" || cartItems.length === 0) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Loading checkout...</p>
      </div>
    );
  }

  // ── Derived totals ──
  const subtotal = cartItems.reduce((s, i) => s + i.price, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // ── Validation ───────────────────────────────────────────────────────────
  const validateAddress = () => {
    const e = {};
    if (!address.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\d{10}$/.test(address.phone)) e.phone = "Enter valid 10-digit phone";
    if (!/^\d{6}$/.test(address.pincode))
      e.pincode = "Enter valid 6-digit pincode";
    if (!address.addressLine1.trim()) e.addressLine1 = "Address is required";
    if (!address.city.trim()) e.city = "City is required";
    if (!address.state) e.state = "Please select a state";
    setAddressErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (!paymentMethod) {
      e.method = "Please select a payment method";
    } else if (paymentMethod === "upi") {
      if (!/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId))
        e.upi = "Enter a valid UPI ID (e.g. name@upi)";
    } else if (paymentMethod === "card") {
      if (!/^\d{16}$/.test(card.number.replace(/\s/g, "")))
        e.cardNumber = "Enter valid 16-digit card number";
      if (!card.name.trim()) e.cardName = "Name on card is required";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry))
        e.expiry = "Enter expiry as MM/YY";
      if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = "Enter valid CVV";
    } else if (paymentMethod === "netbanking") {
      if (!bank) e.bank = "Please select a bank";
    }
    setPaymentErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = () => {
    if (step === 1 && !validateAddress()) return;
    if (step === 2 && !validatePayment()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const placeOrder = async () => {
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, address, paymentMethod, total }),
      });
      const data = await res.json();
      if (res.ok) {
        const oid = data.order?.id || generateOrderId();
        setOrderId(oid);
        sessionStorage.removeItem("checkoutCart");
        setStep(4);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showSnackbar("❌ " + (data.error || "Failed to place order"), "error");
      }
    } catch {
      showSnackbar("❌ Network error. Please try again.", "error");
    } finally {
      setPlacing(false);
    }
  };

  // ── Card number formatter ─────────────────────────────────────────────────
  const formatCard = (val) =>
    val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();

  const formatExpiry = (val) => {
    const v = val.replace(/\D/g, "").slice(0, 4);
    return v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2) : v;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.wrapper}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/products" className={styles.logo}>
            🛍️ ShopHub
          </Link>
          <span className={styles.navTitle}>Secure Checkout</span>
          <span className={styles.navSafe}>🔒 SSL Secured</span>
        </div>
      </nav>

      {/* STEP INDICATOR */}
      {step < 4 && (
        <div className={styles.stepBar}>
          <div className={styles.stepBarInner}>
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s.id} className={styles.stepItem}>
                <div
                  className={`${styles.stepCircle}
                  ${step === s.id ? styles.stepActive : ""}
                  ${step > s.id ? styles.stepDone : ""}`}
                >
                  {step > s.id ? "✓" : s.icon}
                </div>
                <span
                  className={`${styles.stepLabel} ${step >= s.id ? styles.stepLabelActive : ""}`}
                >
                  {s.label}
                </span>
                {i < 2 && (
                  <div
                    className={`${styles.stepLine} ${step > s.id ? styles.stepLineDone : ""}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN LAYOUT */}
      <div className={styles.main}>
        <div className={styles.content}>
          {/* ══════════════ STEP 1 — ADDRESS ══════════════ */}
          {step === 1 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📍 Delivery Address</h2>

              <div className={styles.addressTypeRow}>
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    className={`${styles.typeBtn} ${address.type === t ? styles.typeBtnActive : ""}`}
                    onClick={() => setAddress((a) => ({ ...a, type: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name *</label>
                  <input
                    className={`${styles.input} ${addressErrors.fullName ? styles.inputError : ""}`}
                    placeholder="Enter your full name"
                    value={address.fullName}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, fullName: e.target.value }))
                    }
                  />
                  {addressErrors.fullName && (
                    <span className={styles.error}>
                      {addressErrors.fullName}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Phone Number *</label>
                  <div className={styles.phoneRow}>
                    <span className={styles.phonePrefix}>+91</span>
                    <input
                      className={`${styles.input} ${styles.phoneInput} ${addressErrors.phone ? styles.inputError : ""}`}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={address.phone}
                      onChange={(e) =>
                        setAddress((a) => ({
                          ...a,
                          phone: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                  {addressErrors.phone && (
                    <span className={styles.error}>{addressErrors.phone}</span>
                  )}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Address Line 1 *</label>
                  <input
                    className={`${styles.input} ${addressErrors.addressLine1 ? styles.inputError : ""}`}
                    placeholder="House no., Building name, Street name"
                    value={address.addressLine1}
                    onChange={(e) =>
                      setAddress((a) => ({
                        ...a,
                        addressLine1: e.target.value,
                      }))
                    }
                  />
                  {addressErrors.addressLine1 && (
                    <span className={styles.error}>
                      {addressErrors.addressLine1}
                    </span>
                  )}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>
                    Address Line 2{" "}
                    <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    className={styles.input}
                    placeholder="Landmark, Area, Colony"
                    value={address.addressLine2}
                    onChange={(e) =>
                      setAddress((a) => ({
                        ...a,
                        addressLine2: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Pincode *</label>
                  <input
                    className={`${styles.input} ${addressErrors.pincode ? styles.inputError : ""}`}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) =>
                      setAddress((a) => ({
                        ...a,
                        pincode: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                  {addressErrors.pincode && (
                    <span className={styles.error}>
                      {addressErrors.pincode}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>City *</label>
                  <input
                    className={`${styles.input} ${addressErrors.city ? styles.inputError : ""}`}
                    placeholder="Enter city"
                    value={address.city}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, city: e.target.value }))
                    }
                  />
                  {addressErrors.city && (
                    <span className={styles.error}>{addressErrors.city}</span>
                  )}
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>State *</label>
                  <select
                    className={`${styles.input} ${styles.select} ${addressErrors.state ? styles.inputError : ""}`}
                    value={address.state}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, state: e.target.value }))
                    }
                  >
                    <option value="">Select your state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {addressErrors.state && (
                    <span className={styles.error}>{addressErrors.state}</span>
                  )}
                </div>
              </div>

              <div className={styles.stepActions}>
                <Link href="/products" className={styles.cancelLink}>
                  ← Back to Cart
                </Link>
                <button className={styles.nextBtn} onClick={goNext}>
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ STEP 2 — PAYMENT ══════════════ */}
          {step === 2 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>💳 Payment Method</h2>
              {paymentErrors.method && (
                <p className={styles.error}>{paymentErrors.method}</p>
              )}

              {/* Method selector */}
              <div className={styles.methodGrid}>
                {[
                  {
                    id: "upi",
                    icon: "📲",
                    label: "UPI",
                    sub: "GPay, PhonePe, Paytm",
                  },
                  {
                    id: "card",
                    icon: "💳",
                    label: "Credit / Debit Card",
                    sub: "Visa, Mastercard, RuPay",
                  },
                  {
                    id: "netbanking",
                    icon: "🏦",
                    label: "Net Banking",
                    sub: "All major banks",
                  },
                  {
                    id: "cod",
                    icon: "💵",
                    label: "Cash on Delivery",
                    sub: "Pay when delivered",
                  },
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`${styles.methodCard} ${paymentMethod === m.id ? styles.methodActive : ""}`}
                    onClick={() => {
                      setPaymentMethod(m.id);
                      setPaymentErrors({});
                    }}
                  >
                    <span className={styles.methodIcon}>{m.icon}</span>
                    <div className={styles.methodText}>
                      <span className={styles.methodLabel}>{m.label}</span>
                      <span className={styles.methodSub}>{m.sub}</span>
                    </div>
                    <span className={styles.methodRadio}>
                      {paymentMethod === m.id ? "🔵" : "⚪"}
                    </span>
                  </button>
                ))}
              </div>

              {/* UPI */}
              {paymentMethod === "upi" && (
                <div className={styles.paymentForm}>
                  <div className={styles.upiLogos}>
                    {["GPay", "PhonePe", "Paytm", "BHIM"].map((u) => (
                      <span key={u} className={styles.upiApp}>
                        {u}
                      </span>
                    ))}
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>UPI ID *</label>
                    <input
                      className={`${styles.input} ${paymentErrors.upi ? styles.inputError : ""}`}
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    {paymentErrors.upi && (
                      <span className={styles.error}>{paymentErrors.upi}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Card */}
              {paymentMethod === "card" && (
                <div className={styles.paymentForm}>
                  <div className={styles.cardPreview}>
                    <div className={styles.cardChip}>▪▪▪</div>
                    <div className={styles.cardNumber}>
                      {card.number || "•••• •••• •••• ••••"}
                    </div>
                    <div className={styles.cardBottom}>
                      <span>{card.name || "YOUR NAME"}</span>
                      <span>{card.expiry || "MM/YY"}</span>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Card Number *</label>
                      <input
                        className={`${styles.input} ${paymentErrors.cardNumber ? styles.inputError : ""}`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={card.number}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            number: formatCard(e.target.value),
                          }))
                        }
                      />
                      {paymentErrors.cardNumber && (
                        <span className={styles.error}>
                          {paymentErrors.cardNumber}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                      <label className={styles.label}>Name on Card *</label>
                      <input
                        className={`${styles.input} ${paymentErrors.cardName ? styles.inputError : ""}`}
                        placeholder="As printed on card"
                        value={card.name}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            name: e.target.value.toUpperCase(),
                          }))
                        }
                      />
                      {paymentErrors.cardName && (
                        <span className={styles.error}>
                          {paymentErrors.cardName}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Expiry *</label>
                      <input
                        className={`${styles.input} ${paymentErrors.expiry ? styles.inputError : ""}`}
                        placeholder="MM/YY"
                        maxLength={5}
                        value={card.expiry}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            expiry: formatExpiry(e.target.value),
                          }))
                        }
                      />
                      {paymentErrors.expiry && (
                        <span className={styles.error}>
                          {paymentErrors.expiry}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>CVV *</label>
                      <input
                        className={`${styles.input} ${paymentErrors.cvv ? styles.inputError : ""}`}
                        placeholder="•••"
                        maxLength={4}
                        type="password"
                        value={card.cvv}
                        onChange={(e) =>
                          setCard((c) => ({
                            ...c,
                            cvv: e.target.value.replace(/\D/g, ""),
                          }))
                        }
                      />
                      {paymentErrors.cvv && (
                        <span className={styles.error}>
                          {paymentErrors.cvv}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Net Banking */}
              {paymentMethod === "netbanking" && (
                <div className={styles.paymentForm}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Select Bank *</label>
                    <select
                      className={`${styles.input} ${styles.select} ${paymentErrors.bank ? styles.inputError : ""}`}
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                    >
                      <option value="">Choose your bank</option>
                      {[
                        "SBI",
                        "HDFC Bank",
                        "ICICI Bank",
                        "Axis Bank",
                        "Kotak Mahindra",
                        "Punjab National Bank",
                        "Bank of Baroda",
                        "Canara Bank",
                        "IndusInd Bank",
                        "Yes Bank",
                      ].map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    {paymentErrors.bank && (
                      <span className={styles.error}>{paymentErrors.bank}</span>
                    )}
                  </div>
                  <p className={styles.netBankingNote}>
                    ℹ️ You will be redirected to your bank's secure portal to
                    complete payment.
                  </p>
                </div>
              )}

              {/* COD */}
              {paymentMethod === "cod" && (
                <div className={styles.codBox}>
                  <span className={styles.codIcon}>💵</span>
                  <div>
                    <p className={styles.codTitle}>Cash on Delivery selected</p>
                    <p className={styles.codSub}>
                      Pay ₹{total.toLocaleString("en-IN")} when your order
                      arrives. Please keep exact change ready.
                    </p>
                  </div>
                </div>
              )}

              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={goBack}>
                  ← Back
                </button>
                <button className={styles.nextBtn} onClick={goNext}>
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ STEP 3 — REVIEW ══════════════ */}
          {step === 3 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📋 Review Your Order</h2>

              {/* Address summary */}
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionHeader}>
                  <span className={styles.reviewSectionTitle}>
                    📍 Delivery Address
                  </span>
                  <button className={styles.editBtn} onClick={() => setStep(1)}>
                    Edit
                  </button>
                </div>
                <div className={styles.reviewAddress}>
                  <strong>{address.fullName}</strong> · +91 {address.phone}
                  <br />
                  {address.addressLine1}
                  {address.addressLine2 && <>, {address.addressLine2}</>}
                  <br />
                  {address.city}, {address.state} — {address.pincode}
                  <span className={styles.addressTypePill}>{address.type}</span>
                </div>
              </div>

              {/* Payment summary */}
              <div className={styles.reviewSection}>
                <div className={styles.reviewSectionHeader}>
                  <span className={styles.reviewSectionTitle}>💳 Payment</span>
                  <button className={styles.editBtn} onClick={() => setStep(2)}>
                    Edit
                  </button>
                </div>
                <div className={styles.reviewPayment}>
                  {paymentMethod === "upi" && (
                    <>
                      <span>📲</span> UPI — {upiId}
                    </>
                  )}
                  {paymentMethod === "card" && (
                    <>
                      <span>💳</span> Card ending in {card.number.slice(-4)}
                    </>
                  )}
                  {paymentMethod === "netbanking" && (
                    <>
                      <span>🏦</span> Net Banking — {bank}
                    </>
                  )}
                  {paymentMethod === "cod" && (
                    <>
                      <span>💵</span> Cash on Delivery
                    </>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className={styles.reviewSection}>
                <div
                  className={styles.reviewSectionTitle}
                  style={{ marginBottom: 16 }}
                >
                  🛒 Items ({cartItems.length})
                </div>
                <div className={styles.reviewItems}>
                  {cartItems.map((item, i) => (
                    <div key={i} className={styles.reviewItem}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.reviewItemImg}
                        referrerPolicy="no-referrer"
                      />
                      <div className={styles.reviewItemInfo}>
                        <p className={styles.reviewItemName}>{item.name}</p>
                        <p className={styles.reviewItemCat}>{item.category}</p>
                      </div>
                      <p className={styles.reviewItemPrice}>
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.stepActions}>
                <button className={styles.backBtn} onClick={goBack}>
                  ← Back
                </button>
                <button
                  className={`${styles.placeBtn} ${placing ? styles.placeBtnLoading : ""}`}
                  onClick={placeOrder}
                  disabled={placing}
                >
                  {placing ? (
                    <>
                      <span className={styles.btnSpinner} /> Processing...
                    </>
                  ) : (
                    <>🔒 Place Order · ₹{total.toLocaleString("en-IN")}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════ STEP 4 — CONFIRMATION ══════════════ */}
          {step === 4 && (
            <div className={styles.confirmCard}>
              <div className={styles.confirmAnimation}>🎉</div>
              <h2 className={styles.confirmTitle}>
                Order Placed Successfully!
              </h2>
              <p className={styles.confirmSub}>
                Thank you, <strong>{session?.user?.name || "there"}</strong>!
                <br />
                Your order has been confirmed and will be delivered soon.
              </p>

              <div className={styles.confirmOrderId}>
                <span className={styles.confirmOrderLabel}>Order ID</span>
                <span className={styles.confirmOrderValue}>{orderId}</span>
              </div>

              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span>📍 Deliver to</span>
                  <span>
                    {address.fullName}, {address.city}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>💳 Payment</span>
                  <span>
                    {paymentMethod === "upi" && "UPI"}
                    {paymentMethod === "card" &&
                      `Card ••••${card.number.slice(-4)}`}
                    {paymentMethod === "netbanking" && bank}
                    {paymentMethod === "cod" && "Cash on Delivery"}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>📦 Items</span>
                  <span>
                    {cartItems.length} item{cartItems.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className={`${styles.confirmRow} ${styles.confirmTotal}`}>
                  <span>💰 Total Paid</span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Timeline */}
              <div className={styles.timeline}>
                <div
                  className={`${styles.timelineStep} ${styles.timelineDone}`}
                >
                  <div className={styles.timelineDot}>✓</div>
                  <div className={styles.timelineText}>
                    <strong>Order Confirmed</strong>
                    <span>Just now</span>
                  </div>
                </div>
                <div className={styles.timelineLine} />
                <div className={styles.timelineStep}>
                  <div className={styles.timelineDot}>📦</div>
                  <div className={styles.timelineText}>
                    <strong>Packing</strong>
                    <span>Within 24 hours</span>
                  </div>
                </div>
                <div className={styles.timelineLine} />
                <div className={styles.timelineStep}>
                  <div className={styles.timelineDot}>🚚</div>
                  <div className={styles.timelineText}>
                    <strong>Shipped</strong>
                    <span>1–2 business days</span>
                  </div>
                </div>
                <div className={styles.timelineLine} />
                <div className={styles.timelineStep}>
                  <div className={styles.timelineDot}>🏠</div>
                  <div className={styles.timelineText}>
                    <strong>Delivered</strong>
                    <span>3–5 business days</span>
                  </div>
                </div>
              </div>

              <div className={styles.confirmActions}>
                <Link href="/dashboard" className={styles.dashboardBtn}>
                  📊 Go to Dashboard
                </Link>
                <Link href="/products" className={styles.continueBtn}>
                  🛍️ Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── ORDER SUMMARY SIDEBAR ── */}
        {step < 4 && (
          <aside className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>🧾 Order Summary</h3>

              <div className={styles.summaryItems}>
                {cartItems.map((item, i) => (
                  <div key={i} className={styles.summaryItem}>
                    <div className={styles.summaryItemImg}>
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <p className={styles.summaryItemName}>{item.name}</p>
                      <p className={styles.summaryItemPrice}>
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={shipping === 0 ? styles.free : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>

              {shipping === 0 && (
                <div className={styles.freeShippingBadge}>
                  🎉 You saved ₹49 on shipping!
                </div>
              )}

              <div className={styles.summaryTrust}>
                <span>🔒 Secure Payment</span>
                <span>↩️ Easy Returns</span>
                <span>✅ 100% Genuine</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

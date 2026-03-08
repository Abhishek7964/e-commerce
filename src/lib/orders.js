import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
};

// Load orders from file
export const loadOrdersFromFile = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
};

// Save orders to file
export const saveOrdersToFile = (orders) => {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving orders:", error);
    return false;
  }
};

// Get all orders
export const getAllOrders = () => {
  return loadOrdersFromFile();
};

// Get orders by user email
export const getOrdersByEmail = (email) => {
  const orders = loadOrdersFromFile();
  return orders.filter((order) => order.userEmail === email.toLowerCase().trim());
};

// Create a new order
export const createOrder = (userEmail, cartItems) => {
  try {
    const orders = loadOrdersFromFile();
    
    const newOrder = {
      id: `ORD-${Date.now()}`,
      userEmail: userEmail.toLowerCase().trim(),
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + item.price, 0),
      date: new Date().toISOString().split("T")[0],
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    saveOrdersToFile(orders);
    
    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Reset orders (for testing)
export const resetOrders = () => {
  try {
    ensureDataDir();
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    return true;
  } catch (error) {
    console.error("Error resetting orders:", error);
    return false;
  }
};

// lib/users.js
// File-based persistent user storage for development
// In production, replace with a real database (Prisma, Mongoose, PostgreSQL, etc.)

import fs from "fs";
import path from "path";

// Use a simple relative path approach
const USERS_DB_PATH = "./data/users.json";

// Initialize the default users structure
const DEFAULT_USERS = [
  {
    id: "1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password123",
    role: "user",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];

// Load users from file system
function loadUsersFromFile() {
  try {
    // Check if file exists
    if (fs.existsSync(USERS_DB_PATH)) {
      const fileContent = fs.readFileSync(USERS_DB_PATH, "utf-8");
      return JSON.parse(fileContent);
    } else {
      // File doesn't exist, create it with default users
      ensureDirectoryExists();
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(DEFAULT_USERS, null, 2));
      return DEFAULT_USERS;
    }
  } catch (error) {
    console.error("Error loading users from file:", error.message);
    return DEFAULT_USERS;
  }
}

// Ensure data directory exists
function ensureDirectoryExists() {
  const dir = path.dirname(USERS_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Save users to file system
function saveUsersToFile(users) {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2));
    console.log("✅ Users saved to file successfully");
  } catch (error) {
    console.error("❌ Error saving users to file:", error.message);
  }
}

/**
 * Find user by email (case-insensitive)
 */
export function findUserByEmail(email) {
  const lowerEmail = email.toLowerCase().trim();
  const users = loadUsersFromFile();
  return users.find((u) => u.email.toLowerCase() === lowerEmail);
}

/**
 * Find user by ID
 */
export function findUserById(id) {
  const users = loadUsersFromFile();
  return users.find((u) => u.id === id);
}

/**
 * Create a new user (registration)
 * Returns the created user or null if email already exists
 */
export function createUser(name, email, password) {
  const users = loadUsersFromFile();

  // Check if email already exists
  if (findUserByEmail(email)) {
    console.log("❌ Email already exists:", email);
    return null;
  }

  const newUser = {
    id: String(users.length + 1),
    name,
    email,
    password,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsersToFile(users);
  console.log("✅ New user created:", email);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

/**
 * Get all users (for debugging)
 */
export function getAllUsers() {
  const users = loadUsersFromFile();
  return users.map(({ password, ...user }) => user);
}

/**
 * Reset users to default
 */
export function resetUsers() {
  saveUsersToFile(DEFAULT_USERS);
  console.log("✅ Users reset to default");
}

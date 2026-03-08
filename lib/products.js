// E-commerce Products Database
export const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    description: "High-quality wireless headphones with noise cancellation",
    category: "Electronics",
    rating: 4.5,
    reviews: 128,
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    description: "Feature-rich smartwatch with health tracking",
    category: "Electronics",
    rating: 4.7,
    reviews: 256,
  },
  {
    id: 3,
    name: "4K Webcam",
    price: 99.99,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=300&h=300&fit=crop",
    description: "Professional 4K webcam for streaming and video calls",
    category: "Electronics",
    rating: 4.3,
    reviews: 89,
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1587829191301-cd59cf02ef04?w=300&h=300&fit=crop",
    description: "RGB mechanical keyboard with cherry mx switches",
    category: "Accessories",
    rating: 4.8,
    reviews: 342,
  },
  {
    id: 5,
    name: "USB-C Hub",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop",
    description: "Multi-port USB-C hub with HDMI and SD card reader",
    category: "Accessories",
    rating: 4.4,
    reviews: 156,
  },
  {
    id: 6,
    name: "Phone Stand",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1608236344734-8ef266374b25?w=300&h=300&fit=crop",
    description: "Adjustable aluminum phone stand",
    category: "Accessories",
    rating: 4.6,
    reviews: 203,
  },
  {
    id: 7,
    name: "Portable SSD 1TB",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop",
    description: "Fast and reliable 1TB portable SSD",
    category: "Storage",
    rating: 4.7,
    reviews: 298,
  },
  {
    id: 8,
    name: "Monitor Stand",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1587829191301-cd59cf02ef04?w=300&h=300&fit=crop",
    description: "Adjustable monitor stand with storage compartment",
    category: "Accessories",
    rating: 4.5,
    reviews: 124,
  },
  {
    id: 9,
    name: "Laptop Stand",
    price: 59.99,
    image: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=300&h=300&fit=crop",
    description: "Premium aluminum laptop stand for better ergonomics",
    category: "Accessories",
    rating: 4.8,
    reviews: 567,
  },
  {
    id: 10,
    name: "Wireless Mouse",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
    description: "Precision wireless mouse with long battery life",
    category: "Accessories",
    rating: 4.4,
    reviews: 189,
  },
  {
    id: 11,
    name: "Desk Lamp",
    price: 44.99,
    image: "https://images.unsplash.com/photo-1565636192335-14c3d3f14e0e?w=300&h=300&fit=crop",
    description: "LED desk lamp with adjustable brightness",
    category: "Office",
    rating: 4.6,
    reviews: 274,
  },
  {
    id: 12,
    name: "Cable Organizer Kit",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1617638924702-92f37fcb9443?w=300&h=300&fit=crop",
    description: "Complete cable management solution",
    category: "Accessories",
    rating: 4.5,
    reviews: 421,
  },
];

// Function to get all products
export const getAllProducts = () => {
  return products;
};

// Function to get product by ID
export const getProductById = (id) => {
  return products.find((product) => product.id === id);
};

// Function to get products by category
export const getProductsByCategory = (category) => {
  return products.filter(
    (product) => product.category.toLowerCase() === category.toLowerCase()
  );
};

// Function to search products
export const searchProducts = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
  );
};

import type { ProductCategory } from "../lib/constants.js";

export interface SeedProduct {
  name: string;
  slug: string;
  sku: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  imageUrl: string;
  tags: string[];
}

export const seedProducts: SeedProduct[] = [
  {
    name: "Calm Cloud Gentle Cleanser",
    slug: "calm-cloud-gentle-cleanser",
    sku: "DERM-CLN-001",
    category: "cleanser",
    shortDescription: "Low-foam facial cleanser for everyday use.",
    description:
      "A lightweight gel cleanser that removes oil and sunscreen without leaving skin tight or dry.",
    price: 249,
    stockQuantity: 24,
    lowStockThreshold: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0f?auto=format&fit=crop&w=900&q=80",
    tags: ["daily", "gentle", "student-favorite"]
  },
  {
    name: "Dew Reset Barrier Moisturizer",
    slug: "dew-reset-barrier-moisturizer",
    sku: "DERM-MOI-001",
    category: "moisturizer",
    shortDescription: "Barrier-supporting hydration for combination skin.",
    description:
      "A cream-gel moisturizer with niacinamide-inspired comfort notes for busy students and commuters.",
    price: 329,
    stockQuantity: 18,
    lowStockThreshold: 6,
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80",
    tags: ["hydrating", "barrier", "everyday"]
  },
  {
    name: "Sunveil Daily Shield SPF 50",
    slug: "sunveil-daily-shield-spf-50",
    sku: "DERM-SUN-001",
    category: "sunscreen",
    shortDescription: "Budget-friendly broad-spectrum sunscreen.",
    description:
      "A no-white-cast sunscreen designed for humid weather, morning classes, and daily city errands.",
    price: 399,
    stockQuantity: 20,
    lowStockThreshold: 8,
    imageUrl:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80",
    tags: ["spf", "lightweight", "daily-use"]
  },
  {
    name: "Clear Dot Acne Rescue Serum",
    slug: "clear-dot-acne-rescue-serum",
    sku: "DERM-SER-001",
    category: "serum",
    shortDescription: "Targeted serum for blemish-prone skin.",
    description:
      "A quick-absorbing serum made for calming visible congestion and supporting a smoother skin feel.",
    price: 359,
    stockQuantity: 14,
    lowStockThreshold: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=900&q=80",
    tags: ["acne", "serum", "treatment"]
  },
  {
    name: "Dorm Glow Gift Bundle",
    slug: "dorm-glow-gift-bundle",
    sku: "DERM-BUN-001",
    category: "gift_bundle",
    shortDescription: "Starter skincare bundle for gifting.",
    description:
      "A curated set with cleanser, moisturizer, and sunscreen designed for first-time skincare buyers.",
    price: 899,
    stockQuantity: 10,
    lowStockThreshold: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    tags: ["bundle", "gift", "starter"]
  }
];

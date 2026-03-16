import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { seedProducts } from "../data/seedProducts.js";
import { ProductModel } from "../models/Product.js";
import { UserModel } from "../models/User.js";

export async function ensureSeedAdmin() {
  const existingAdmin = await UserModel.findOne({ email: env.SEED_ADMIN_EMAIL.toLowerCase() });

  if (existingAdmin) {
    return existingAdmin;
  }

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);

  return UserModel.create({
    fullName: "DermEase Admin",
    email: env.SEED_ADMIN_EMAIL.toLowerCase(),
    mobileNumber: "09170000000",
    passwordHash,
    role: "admin"
  });
}

export async function seedStarterProducts() {
  for (const product of seedProducts) {
    await ProductModel.updateOne({ slug: product.slug }, { $setOnInsert: product }, { upsert: true });
  }
}


import { connectDatabase } from "../config/db.js";
import { ensureSeedAdmin, seedStarterProducts } from "../services/seed.service.js";

async function run() {
  await connectDatabase();
  await ensureSeedAdmin();
  await seedStarterProducts();

  console.log("Seed data loaded into the school database.");
  process.exit(0);
}

run().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});

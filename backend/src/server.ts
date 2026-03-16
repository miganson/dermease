import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { ensureSeedAdmin } from "./services/seed.service.js";

async function bootstrap() {
  await connectDatabase();
  await ensureSeedAdmin();

  app.listen(env.PORT, () => {
    console.log(`DermEase API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

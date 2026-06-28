import { auth } from "../src/lib/auth";
import { closeDb } from "../src/lib/db";
import { getMigrations } from "better-auth/db/migration";

async function main() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  console.log("Better Auth migrations completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
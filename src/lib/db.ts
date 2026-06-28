import { Kysely } from "kysely";
import { NeonDialect } from "kysely-neon";
import { neon } from "@neondatabase/serverless";
import { DatabaseSchema } from "./db-schema";

declare global {
  // eslint-disable-next-line no-var
  var __ibnKyselyDb: Kysely<DatabaseSchema> | undefined;
}

function createDb() {
  const connectionString = process.env.DATABASE_URL;
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  if (!connectionString || isBuildPhase) {
    if (isBuildPhase) {
      console.log("ℹ️ Info: Next.js build phase detected. Using mock database dialect to prevent network hangs.");
    } else {
      console.warn("⚠️ WARNING: DATABASE_URL is missing. Database queries will return empty fallbacks.");
    }
    return new Kysely<DatabaseSchema>({
      dialect: {
        createAdapter: () => ({
          init: () => Promise.resolve(),
          getMetadata: () => ({ lockTableSupported: false }),
        }),
        createDriver: () => ({
          init: () => Promise.resolve(),
          acquireConnection: () => Promise.resolve({
            executeQuery: () => Promise.resolve({ rows: [] }),
          }),
          beginTransaction: () => Promise.resolve(),
          commitTransaction: () => Promise.resolve(),
          rollbackTransaction: () => Promise.resolve(),
          releaseConnection: () => Promise.resolve(),
          destroy: () => Promise.resolve(),
        }),
        createIntrospector: () => ({
          getSchemas: () => Promise.resolve([]),
          getTables: () => Promise.resolve([]),
          getMetadata: () => Promise.resolve([]),
        }),
        createQueryCompiler: () => ({
          compileQuery: () => ({ sql: "SELECT 1", parameters: [] }),
        }),
      } as any
    });
  }

  const db =
    globalThis.__ibnKyselyDb ??
    new Kysely<DatabaseSchema>({
      dialect: new NeonDialect({
        neon: neon(connectionString),
      }),
    });

  if (!globalThis.__ibnKyselyDb) {
    globalThis.__ibnKyselyDb = db;
  }

  return db;
}

export const db = createDb();

export async function closeDb() {
  globalThis.__ibnKyselyDb = undefined;
}
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Make sure the .env file is loaded.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
  // log: [{ emit: "event", level: "query" }, "warn", "error"],
});

// prisma.$on("query", (e) => {
//   console.log("SQL:", e.query);
//   console.log("Params:", e.params);
//   console.log("Duration:", e.duration, "ms");
// });

export default prisma;

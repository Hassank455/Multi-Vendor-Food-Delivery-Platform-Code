import app from "./app";
import prisma from "./lib/prisma";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to DB (Prisma)");

    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  }
}

startServer();
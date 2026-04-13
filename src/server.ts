import express from "express";
import prisma from "./lib/prisma";
import routes from "./routes";

const app = express();

app.use(express.json());

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to DB (Prisma)");

    app.get("/", async (req, res) => {
      try {
        const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW()`;
        res.json({
          status: "OK",
          dbTime: result[0].now,
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.use("/api/v1", routes);

    app.listen(3000, () => {
      console.log("🚀 Server running on port 3000");
    });

  } catch (err) {
    console.error("❌ Failed to connect to DB", err);
    process.exit(1);
  }
}

startServer();
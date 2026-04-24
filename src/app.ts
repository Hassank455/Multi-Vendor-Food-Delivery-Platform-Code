import express from "express";
import prisma from "./lib/prisma";
import routes from "./routes";
import { errorHandler } from "./middlewares/index";

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW()`;
    res.json({
      status: "OK",
      dbTime: result[0].now,
    });
  } catch (err: any) {
    console.error("DB query failed", err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/v1", routes);

// Global error handler
app.use(errorHandler);

export default app;

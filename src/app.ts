import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import prisma from "./lib/prisma";
import routes from "./routes";
import { errorHandler } from "./middlewares/index";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./config/swagger.json";

const app = express();

// we used cors to enable Cross-Origin Resource Sharing, it's a best practice to use it in production, but in development we can allow all origins, in production we should specify the allowed origins
app.use(cors());
// we used helmet to secure our app by setting various HTTP headers, it's a best practice to use it in production
app.use(helmet());
// we used morgan to log HTTP requests, it's a best practice to use it in development, but in production we can use a more advanced logging solution like winston or pino
app.use(morgan("dev"));

// we used helmet's contentSecurityPolicy middleware to set the Content-Security-Policy header, which helps to prevent Cross-Site Scripting (XSS) attacks and other code injection attacks, we allow scripts and frames from our own domain and from Stripe's domain, and we allow connections to our own domain and to Stripe's API
// if we add more sources we need to add them to the directives object
// e.g. if we want to allow images from a CDN, we can add imgSrc: ["'self'", 'https://cdn.example.com'] to the directives object
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  }),
);

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

// Swagger Docs Setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global error handler
app.use(errorHandler);

export default app;

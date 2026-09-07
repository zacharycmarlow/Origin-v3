import express, { type Express } from "express";
import cors from "cors";
import compression from "compression";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Trust proxy — required for correct IP detection behind Cloudflare/Replit proxies.
app.set("trust proxy", 1);

// Compress responses.
app.use(compression());

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// Restrict CORS to known trusted origins only.
// origin: true (dynamic reflection) + credentials: true is a security hole —
// any site could make authenticated cross-origin requests with session cookies.
const trustedOrigins = new Set<string>([
  // Configurable allowed origins (comma-separated)
  ...(process.env.CORS_ALLOWED_ORIGINS?.split(",").map((d) => d.trim()) ?? []),
  // Localhost variants for local curl/testing (no credentials at risk here)
  "http://localhost",
  "http://localhost:80",
  "http://127.0.0.1",
]);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      // No origin = same-origin or non-browser (server-to-server) request — allow
      if (!origin || trustedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware is only applied when a secret key is configured.
// In local dev without Clerk, the API server runs in "guest mode" —
// auth-protected routes will return 401, but public routes (healthz,
// readings, waitlist) work without a Clerk instance.
const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY);
if (hasClerkSecret) {
  app.use(
    clerkMiddleware((req) => ({
      publishableKey: publishableKeyFromHost(
        getClerkProxyHost(req) ?? "",
        process.env.CLERK_PUBLISHABLE_KEY,
      ),
    })),
  );
} else {
  logger.warn(
    "CLERK_SECRET_KEY not set — running in guest mode (auth-protected routes will 401)",
  );
}

app.use("/api", router);

export default app;

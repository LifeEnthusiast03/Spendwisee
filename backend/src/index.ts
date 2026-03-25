import express, { Request, Response,Application } from "express";
import 'dotenv/config'
import cors from "cors";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import passport from "./config/passport.js";
import authrouter  from "./routes/auth_route.js";
import incomerouter  from "./routes/income_route.js"
import expenserouter  from "./routes/expense_route.js";
const app:Application = express();
const PORT = 3000;
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173").split(',').map(url => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
      prefix: "spendwise:sess:",
    }),
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
)

app.use(passport.initialize());
app.use(passport.session());
app.use(authrouter);
app.use(incomerouter);
app.use(expenserouter);

const startServer = async () => {
  await redisClient.connect();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
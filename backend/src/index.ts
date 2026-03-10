import express, { Request, Response,Application } from "express";
import 'dotenv/config'
import session from "express-session";
import passport from "./config/passport.js";
import router  from "./routes/auth_route.js";
const app:Application = express();
const PORT = 3000;

app.use(express.json());
app.use(
  session({
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

app.use(passport.initialize())
app.use(passport.session())
app.use(router)

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
import { Router,Request,Response } from "express";
import passport from "passport";
import { isAuthenticated } from "../middleware/auth_middleware.js";

const router = Router()

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
)

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
)

router.get("/", (req: Request, res: Response) => {
  res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>')
})

router.get("/login", (req: Request, res: Response) => {
  res.send('<h1>Login</h1><a href="/auth/google">Login with Google</a>')
})

// Protected route
router.get("/dashboard", isAuthenticated, (req: Request, res: Response) => {
  const user = req.user  // fully typed as IUser ✓
  res.send(`
    <h1>Dashboard</h1>
    <p>Welcome, ${user?.firstname}</p>
    <p>email,${user?.email}
    <br><a href="/logout">Logout</a>
  `)
})

export default router

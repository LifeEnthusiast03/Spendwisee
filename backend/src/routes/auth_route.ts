import { Router,Request,Response } from "express";
import passport from "passport";
import bcrypt from "bcrypt"
import type { IVerifyOptions } from "passport-local";
import { isAuthenticated } from "../middleware/auth_middleware.js";
import {prisma} from "../lib/prisma.js"

const router = Router()

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, name, password } = req.body

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
       res.status(400).json({ message: "Email already in use" })
       return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    })

    res.status(201).json({ message: "Registered successfully" })

  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})


router.post("/auth/login", (req: Request, res: Response, next) => {
  console.log("[login] body received:", { email: req.body?.email, passwordPresent: !!req.body?.password })
  passport.authenticate(
    "local",
    (err: Error | null, user: Express.User | false, info: IVerifyOptions) => {
      if (err) {
        console.log("[login] error:", err)
        return next(err)
      }
      if (!user) {
        console.log("[login] auth failed, reason:", info?.message)
        const reason = encodeURIComponent(info?.message ?? 'Login failed')
        return res.redirect(`http://localhost:5173/login?error=${reason}`)
      }
      req.logIn(user, (loginError) => {
        if (loginError) {
          console.log("[login] session error:", loginError)
          return next(loginError)
        }
        console.log("[login] success, redirecting to dashboard")
        res.redirect("/dashboard")
      })
    }
  )(req, res, next)
})
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
    <p>Welcome, ${user?.name}</p>
    <p>email,${user?.email}</p>
    <p>google id ${user?.googleId}
    <br><a href="/logout">Logout</a>
  `)
})

export default router

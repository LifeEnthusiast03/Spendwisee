import { Router,Request,Response } from "express";
import passport from "passport";
import bcrypt from "bcrypt"
import type { IVerifyOptions } from "passport-local";
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
        const reason = encodeURIComponent(info?.message ?? 'Login failed')
        res.redirect(`http://localhost:5173/login?error=${reason}`)
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
    successRedirect: "http://localhost:5173",
    failureRedirect: "http://localhost:5173/login",
  })
)

router.get("/", (req: Request, res: Response) => {
  res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>')
})


router.get("/auth/user", async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch user" })
  }
})

router.post("/auth/logout", (req: Request, res: Response) => {
  req.logout((logoutError) => {
    if (logoutError) {
      return res.status(500).json({ message: "Failed to logout" })
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return res.status(500).json({ message: "Failed to destroy session" })
      }

      res.clearCookie("connect.sid")
      return res.status(200).json({ message: "Logged out successfully" })
    })
  })
})


export default router

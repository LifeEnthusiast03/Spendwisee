export interface IUser {
  id?: number
  email: string
  name: string | null
  googleId?: string | null
  password?: string | null
}
declare module "express-session" {
  interface SessionData {
    passport: {
      user: IUser
    }
  }
}

// Extend passport user on req.user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

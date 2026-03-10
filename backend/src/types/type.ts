export interface IUser {
  id: string
  firstname: string
  lastname?:string
  email: string
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

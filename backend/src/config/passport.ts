import passport from "passport";
import { Strategy as GoogleStrategy, Profile,VerifyCallback } from "passport-google-oauth20";
import {Strategy as LocalStrategy,IVerifyOptions} from "passport-local"
import bcrypt from "bcrypt"
import { IUser } from "../types/type.js";
import {prisma} from "../lib/prisma.js"

passport.serializeUser((user:IUser,done)=>{
        done(null, (user as IUser).id)
})
passport.deserializeUser(async (id: number, done) => {
  try {
    // fetch fresh user from DB on every request
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err)
  }
})
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    async(
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try{
        const user = await prisma.user.findUnique({
          where:{googleId : profile.id}
        })
        if(user){
          return done(null, user)
        }
        const email = profile.emails?.[0].value ?? ""
        const name= profile.displayName
        const newuser = await prisma.user.create({
          data:{
              email,
              name,
              googleId:profile.id
            }
        })
        return done(null, newuser)
      }
      catch(err){
          return done(err as Error)
      }
    }
  )
)

export default passport

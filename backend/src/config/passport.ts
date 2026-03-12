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
        let user = await prisma.user.findUnique({
          where:{googleId : profile.id}
        })
        if(user){
          return done(null, user)
        }
        const email = profile.emails?.[0].value ?? ""
        const existingUser = await prisma.user.findUnique({ where: { email } })

        if (existingUser) {
            user = await prisma.user.update({
            where: { email },
            data: { googleId: profile.id }
          })
          return done(null, user)
        }

        const newUser = await prisma.user.create({
          data: {
            googleId: profile.id,
            email,
            name: profile.displayName,
          }
        })
        return done(null, newUser)
      }
      catch(err){
          return done(err as Error)
      }
    }
  )
)
passport.use(
  new LocalStrategy(
    { usernameField: "email" },  
    async (email: string, password: string, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } })
        
        if (!user) {
          console.log("No user with that email");
          return done(null, false, { message: "No user with that email" })
          
          
        }

        if (!user.password) {
          console.log("Please login with Google" );
          return done(null, false, { message: "Please login with Google" })
          
          
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          console.log("Incorrect password");
          return done(null, false, { message: "Incorrect password" })
          
          
        }

        return done(null, user)

      } catch (err) {
        return done(err)
      }
    }
  )
)
export default passport

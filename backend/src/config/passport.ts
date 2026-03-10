import passport from "passport";
import { Strategy as GoogleStrategy, Profile,VerifyCallback } from "passport-google-oauth20";
import { IUser } from "../types/type.js";

passport.serializeUser((user:IUser,done)=>{
        done(null,user);
})
passport.deserializeUser((user:IUser,done)=>{
    done(null,user)
})
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/auth/google/callback",
    },
    (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      // Build typed user object from Google profile
      const user: IUser = {
        id: profile.id,
        firstname: profile.displayName,
        email: profile.emails?.[0].value ?? "",
      }

      // Here you'd do DB find/create
      return done(null, user)
    }
  )
)

export default passport

import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { env } from '~/config/environment.js'
import User from '../models/User.model.js'

// === GOOGLE STRATEGY ===
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('Google account does not have an email associated.'), null);
      }

      // 1. Find user by googleId
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }

      // 2. Find user by email and link account
      user = await User.findOne({ email: email });
      if (user) {
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      // 3. Create new user
      const newUser = new User({
        googleId: profile.id,
        email: email,
        displayName: profile.displayName,
        firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
        lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
        provider: 'google'
      });
      await newUser.save();
      return done(null, newUser);

    } catch (err) {
      return done(err, null);
    }
  }))
}

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

export default passport
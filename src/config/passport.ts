// Importing necessary modules
import passport from 'passport';
import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import User, { UserAttributes } from '../database/models/user';
import getDefaultRole from '../helpers/defaultRoleGenerator';

// Defining options required for Google OAuth 2.0 authentication strategy
const googleStrategyOptions: StrategyOptionsWithRequest = {
  clientID: process.env.GOOGLE_CLIENT_ID as string,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
  passReqToCallback: true,
};

// Configuring Google OAuth 2.0 authentication strategy
passport.use(
  new GoogleStrategy(googleStrategyOptions, async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user's email is present in the Google profile
      if (!profile.emails || profile.emails.length === 0) {
        return done(new Error('Email not found in the Google profile'), undefined);
      }

      // Extract user's email from the Google profile
      const email = profile.emails[0].value;

      // Query the database to find an existing user with the same email
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return done(null, existingUser);
      }

      // If no existing user is found, create a new user
      const newUserAttributes: Partial<UserAttributes> = {
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName || '',
        googleId: profile.id,
        photoUrl: profile.photos?.[0]?.value || '',
        gender: 'not specified',
        email,
        verified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        RoleId: await getDefaultRole(),
      };

      const newUser = await User.create(newUserAttributes as UserAttributes);

      return done(null, newUser);
    } catch (error) {
      done(error as Error, undefined);
    }
  })
);

// Serialize user into a session
passport.serializeUser((user: unknown, done) => {
  const typedUser = user as User;
  done(null, typedUser.id);
});

// Deserialize user from a session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

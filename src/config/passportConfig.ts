import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'; // Importing Passport JWT strategy
import User from '../database/models/user';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY!,
};
// Configure JWT authentication strategy
passport.use(
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    try {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      // Check if JWT has expired
      if (jwtPayload.exp < currentTime) {
        return done(null, false); // If expired, return false to indicate authentication failure
      }
      // Find user in the database using the ID from the JWT payload
      const user = await User.findOne({
        where: { id: jwtPayload.id },
      });

      // If user is found, return the user object to indicate successful authentication
      if (user) {
        return done(null, user);
      } else {
        return done(null, false); // If user is not found, return false to indicate authentication failure
      }
    } catch (error) {
      return done(error, false); // If an error occurs during authentication, pass it to the callback
    }
  })
);

// Export the configured Passport middleware
export default passport;

const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const User = require('./models/user');

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = await User.findOne({ email: email });
    if (user == null) {
      return done(null, false, { message: 'No user with that email' });
    }

    try {
      if (await bcryptjs.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Password incorrect' });
      }
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser)),
    passport.serializeUser((user, done) => done(null, user.id)),
    passport.deserializeUser(async (id, done) => {
      return done(null, await User.findById(id));
    });
}

module.exports = initialize;

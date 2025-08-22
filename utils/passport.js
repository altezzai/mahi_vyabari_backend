// const passport = require("passport");
// const googleStrategy = require("passport-google-oauth2").Strategy;
// const User = require("../models/User");

// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findOne({ googleId: id });
//     console.log(user);
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

// passport.use(
//   new googleStrategy(
//     {
//       clientID: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: process.env.CALLBACK_URL,
//       passReqToCallback: true,
//     },
//     async (request, accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({
//           where: { email: profile.emails[0].value },
//         });
//         if (user) {
//           if (!user.googleId) {
//             user.googleId = profile.id;
//             user.image = user.image || profile.photos[0].value;
//             await user.save();
//           }
//         } else {
//           user = await User.create({
//             googleId: profile.id,
//             email: profile.emails[0].value,
//             name: profile.displayName,
//             image: profile.photos[0].value,
//           });
//         }
//         return done(null, profile);
//       } catch (error) {
//         return done(error, null);
//       }
//     }
//   )
// );

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_REDIRECT_URI, // ✅ Ensure this matches Google Console
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    // ✅ Create new user if not found
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        profileImage: profile.photos[0]?.value || "",
                        password: "",
                        isGoogleUser: true, // ✅ Set flag
                    });
                }

                return done(null, user); // ✅ Send user object
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// ✅ Fix: Use `_id` instead of `id`
passport.serializeUser((user, done) => {
    done(null, user._id); // ✅ Ensure `_id` is stored in session
});

// ✅ Fix: Deserialize properly
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

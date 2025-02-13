const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Step 1: Redirect to Google OAuth login
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// ✅ Step 2: Handle Google OAuth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        console.log('req', req)
        try {
            if (!req.user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
            }

            const user = await User.findById(req.user._id);

            const token = jwt.sign(
                { id: user._id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            console.log("✅ OAuth Success: User logged in", user);
            console.log('token', token)
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "None", // ✅ Required for cross-origin cookies
                domain: ".savornshare.vercel.app", //  Match frontend domain
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            // ✅ Redirect to homepage (let frontend handle token retrieval)
            res.redirect(`${process.env.FRONTEND_URL}/`);
        } catch (error) {
            console.error("❌ JWT Error:", error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    }
);


// ✅ POST Route: Handle Google Login
router.post("/google", async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        // ✅ Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Validate with your Google Client ID
        });

        const payload = ticket.getPayload(); // Extract user info from Google
        console.log("✅ Google Payload:", payload);

        const { email, name, picture } = payload;

        // ✅ Find or Create User in MongoDB
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                profileImage: picture, // Store Google profile picture
                isGoogleUser: true, // ✅ Mark as Google-authenticated user
            });

            await user.save();
        }

        // ✅ Generate JWT Token for session
        const sessionToken = jwt.sign(
            { id: user._id, email: user.email, isGoogleUser: true },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Send Token as HttpOnly Cookie (for security)
        res.cookie("token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // ✅ Secure in production
            sameSite: "None", //  Required for cross-origin cookies
            domain: ".savornshare.vercel.app", //  Match frontend domain
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
        });

        // ✅ Send User Data to Frontend
        res.json({ user, token: sessionToken });

    } catch (error) {
        console.error("❌ Google Auth Error:", error);
        res.status(401).json({ message: "Google authentication failed" });
    }
});



router.get("/logout", async (req, res) => {
    try {
        console.log("🔹 Backend: Clearing token cookie...");

        // ✅ Clear the token cookie
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None", //  Required for cross-origin cookies
            domain: ".savornshare.vercel.app", //  Match frontend domain
            expires: new Date(0), // ✅ Expire the cookie immediately
        });

        console.log("✅ Token cookie cleared!");

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("❌ Logout Error:", error);
        res.status(500).json({ message: "Logout failed" });
    }
});



module.exports = router;

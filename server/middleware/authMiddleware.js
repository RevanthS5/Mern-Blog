const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const HttpError = require("../models/errorModel");

const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // ✅ 1️⃣ Check for token in Cookies (Google OAuth)
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // ✅ 2️⃣ Check for token in Authorization Header (Manual Login)
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // ✅ If no token found, return Unauthorized error
        if (!token) {
            return next(new HttpError("Unauthorized. No token provided", 401));
        }

        // ✅ Verify JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Find User in Database
        const user = await User.findById(decoded.id).select("-password"); // Don't return password
        if (!user) {
            return next(new HttpError("Unauthorized. User not found", 403));
        }

        req.user = user; // Attach user data to `req.user`
        next();
    } catch (error) {
        return next(new HttpError("Unauthorized. Invalid token", 403));
    }
};

module.exports = authMiddleware;

const express = require('express');
require('dotenv').config();
const { connect } = require("mongoose");
const cors = require('cors');
const fileUpload = require('express-fileupload');
const passport = require('passport'); // ✅ Google OAuth
const session = require('express-session'); // ✅ Required for Passport
const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); // 
require("./utils/passportSetup"); // ✅ Import Passport Google OAuth Setup



const { notFound, errorHandler } = require('./middleware/errorMiddleware');


const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS Configuration
const corsOptions = {
    origin: ["http://localhost:3000", "https://savornshare.vercel.app"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ✅ Session Middleware (Required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Secure in production
}));


// ✅ Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// ✅ File Upload Middleware
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
}));

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes); // ✅ Google OAuth Routes

// ✅ Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// ✅ Connect to MongoDB and Start Server
const startServer = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        app.listen(process.env.PORT || 8080, () => {
            console.log(`Server running on port ${process.env.PORT || 8080}`);
        });
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1); // Stop the process if DB fails
    }
};

startServer();

module.exports = app;

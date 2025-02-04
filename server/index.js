const express = require('express');
require('dotenv').config();
const { connect } = require("mongoose");
const cors = require('cors');
const upload = require('express-fileupload');
const path = require('path');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = ["http://localhost:3000", "https://savornshare.vercel.app"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow authentication headers
};
app.use(cors(corsOptions));

// File Upload Configuration (Works on Vercel)
app.use(upload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and Start Server
const startServer = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        app.listen(process.env.PORT || 8080, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 8080}`);
        });
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1); // Stop the process if DB fails
    }
};

startServer();

module.exports = app;

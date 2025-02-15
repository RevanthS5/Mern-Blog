// const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { v4: uuid } = require("uuid")
const fs = require('fs')
const path = require('path')
const cloudinary = require("cloudinary").v2;


const User = require('../models/userModel');
const HttpError = require('../models/errorModel');
const authMiddleware = require("../middleware/authMiddleware");


const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, password2 } = req.body;

        if (!name || !email || !password) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        if (password !== password2) {
            return next(new HttpError("Passwords do not match.", 422));
        }

        const newEmail = email.toLowerCase();
        const emailExists = await User.findOne({ email: newEmail });
        if (emailExists) {
            return next(new HttpError("Email already exists.", 422));
        }

        // ✅ Default Cloudinary Avatar
        const DEFAULT_AVATAR = "https://res.cloudinary.com/dj1sakhgo/image/upload/v1738779346/default-profile-pic_mbukpq.png";

        let profileImage = DEFAULT_AVATAR; // Assign default avatar

        // ✅ If a profile picture is uploaded, upload it to Cloudinary
        if (req.files && req.files.profilePicture) {
            const { profilePicture } = req.files;
            const uploadedImage = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
                folder: "profile_pictures",
                public_id: `profile_${Date.now()}`,
                overwrite: true,
            });
            profileImage = uploadedImage.secure_url;
        }

        // ✅ Create new user with the profile image
        const newUser = await User.create({
            name,
            email: newEmail,
            password,
            profileImage, // ✅ Now profileImage is always saved
        });

        res.status(201).json({ message: `New user ${newUser.email} registered.` });
    } catch (error) {
        return next(new HttpError("User registration failed.", 500));
    }
};


// JWT generator
const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1d"});
    return token;
}

const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Fill in all fields.", 422))
        }

        const newEmail = email.toLowerCase()

        const user = await User.findOne({email: newEmail});
        if(!user) {
            return next(new HttpError("Invalid Credentials.", 422))
        }

        const {_id: id, name} = user;
        const token = generateToken({id, name})
        res.status(200).json({token, id, name})
    } catch (error) {
        return next(new HttpError("Login failed. Please check your credentials.", 422))
    }
}

// for profile page
const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        // Ensure `profileImage` exists (fallback to default Cloudinary avatar)
        const DEFAULT_AVATAR = "https://res.cloudinary.com/dj1sakhgo/image/upload/v1738779346/default-profile-pic_mbukpq.pngg";
        user.profileImage = user.profileImage || DEFAULT_AVATAR;

        res.status(200).json(user);
    } catch (error) {
        return next(new HttpError("Something went wrong.", 500));
    }
};



const logoutUser = (req, res, next) => {
    console.log('Server hit here for logout')
    try {
        // ✅ Clear the JWT cookie
        res.cookie('token', '', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production", // Use Secure flag in production
            sameSite: "None", // Ensures proper handling across domains
            expires: new Date(0) // Expires instantly
        });

        // ✅ Google OAuth: Destroy Session (if applicable)
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return next(new HttpError("Logout failed.", 500));
                }
            });
        }

        // ✅ Return Success Response
        res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        return next(new HttpError("Logout failed.", 500));
    }
};


// Change user profile picture
const changeAvatar = async (req, res, next) => {
    try {

        if (!req.files || !req.files.profilePicture) {
            return next(new HttpError("No image uploaded.", 422));
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new HttpError("User not found.", 404));
        }

        const { profilePicture } = req.files;
        if (profilePicture.size > 500000) {
            return next(new HttpError("Profile picture too big. File size should be under 500KB", 422));
        }

        const uploadedImage = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
            folder: "profile_pictures",
            public_id: `profile_${user._id}`,
            overwrite: true,
        });

        user.profileImage = uploadedImage.secure_url;
        await user.save();

        res.status(200).json({ message: "Profile image updated", user });
    } catch (error) {
        return next(new HttpError("Failed to update profile image.", 500));
    }
};

// function to update current user details fromm User Profile
const editUser = async (req, res, next) => {
    try {
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        // ✅ Get user from database
        const user = await User.findById(req.user.id);
        if (!user) {
            return next(new HttpError("User not found.", 403));
        }

        // ✅ Ensure new email doesn't already exist (case insensitive)
        const newEmail = email.toLowerCase();
        const emailExist = await User.findOne({ email: newEmail });
        if (emailExist && emailExist._id.toString() !== req.user.id) {
            return next(new HttpError("Email already exists.", 422));
        }

        // ✅ Compare current password (Plain Text Check)
        if (user.password !== currentPassword) {
            return next(new HttpError("Invalid current password.", 422));
        }

        // ✅ Compare new passwords
        if (newPassword !== confirmNewPassword) {
            return next(new HttpError("New passwords do not match.", 422));
        }

        let profileImage = user.profileImage; // Keep the current profile image by default

        // ✅ If a new profile image is uploaded, update it in Cloudinary
        if (req.files && req.files.profilePicture) {
            const { profilePicture } = req.files;

            // Upload new image to Cloudinary
            const uploadedImage = await cloudinary.uploader.upload(profilePicture.tempFilePath, {
                folder: "profile_pictures",
                public_id: `profile_${user._id}`,
                overwrite: true,
            });

            profileImage = uploadedImage.secure_url;

            // ✅ If user had an existing Cloudinary image, delete the old one
            if (user.profileImage && !user.profileImage.includes("default-avatar.png")) {
                const oldImagePublicId = user.profileImage.split('/').slice(-1)[0].split('.')[0];
                await cloudinary.uploader.destroy(`profile_pictures/${oldImagePublicId}`);
            }
        }

        // ✅ Update user details in database
        user.name = name;
        user.email = newEmail;
        user.password = newPassword;
        user.profileImage = profileImage;
        const updatedUser = await user.save();

        if (!updatedUser) {
            return next(new HttpError("Failed to update user details in database.", 500));
        }

        res.status(200).json({ message: "User updated successfully", user: updatedUser });

    } catch (error) {
        return next(new HttpError(error.message || "Something went wrong.", 500));
    }
};




const getAuthors = async (req, res, next) => {
    try {
        // Fetch all users and exclude passwords
        const authors = await User.find().select('-password');
        if (!authors || authors.length === 0) {
            return next(new HttpError("No users found.", 404));
        }

        res.json(authors);
    } catch (error) {
        return next(new HttpError("Fetching users failed, please try again later.", 500));
    }
};

const getMe = async (req, res, next) => {
    try {
        const token = req.cookies.token; // ✅ Read JWT from cookie
        console.log('token', token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. No token provided." });
        }

        // ✅ Decode token & fetch user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};









module.exports = {registerUser, loginUser, logoutUser, getUser, changeAvatar, editUser, getAuthors, getMe}
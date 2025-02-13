const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require("uuid")
const HttpError = require('../models/errorModel')
const { mongoose } = require('mongoose')
const buffer =  require('base64-arraybuffer');
const cloudinary = require("cloudinary").v2;



//============================== CREATE NEW POST
// POST : api/posts/
// PROTECTED
// Create imageURL's using cloudinary
const createPost = async (req, res, next) => {
    try {
        let { title, category, description } = req.body;

        if (!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose a thumbnail.", 422));
        }

        const { thumbnail } = req.files;

        // ✅ Check file size
        if (thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail too big. File size should be less than 2MB"));
        }

        // ✅ Upload Image to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
            folder: "post_thumbnails",
            public_id: `thumbnail_${Date.now()}`,
            overwrite: true,
        });

        // ✅ Create the Post in MongoDB
        const newPost = await Post.create({
            title,
            category,
            description,
            creator: req.user.id,
            imageURL: uploadedImage.secure_url, // ✅ Store Cloudinary URL instead of Base64
        });

        if (!newPost) {
            return next(new HttpError("Something went wrong. Post could not be created.", 422));
        }

        // ✅ If post creation is successful, increment user's `posts` count
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            { $inc: { posts: 1 } }, // ✅ Increment `posts` by 1
            { new: true } // ✅ Return the updated user document
        );

        if (!updatedUser) {
            return next(new HttpError("Post created, but user post count update failed.", 500));
        }

        res.status(201).json(newPost);
    } catch (error) {
        console.error("❌ Error in createPost:", error);
        return next(new HttpError(error.message || "Server error", 500));
    }
};



//============================== GET ALL POSTS
// GET : api/posts/
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        // Fetch all posts and sort by latest update
        const posts = await Post.find().sort({ updatedAt: -1 });
        // No need to decode images (Cloudinary already provides URL)
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError("Fetching posts failed, please try again later.", 500));
    }
};


//============================== GET SINGLE POSTS
// GET : api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postID = req.params.id;

        //  Fetch post by ID
        const post = await Post.findById(postID);
        if (!post) {
            return next(new HttpError("Post not found.", 404));
        }

        //  No need to decode the image, just return the post as it is
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError("Fetching post failed, please try again later.", 500));
    }
};



//============================== GET POSTS BY CATEGORY
// GET : api/posts/categories/:category
// UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;

        // Fetch posts by category and sort by newest first
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 });

        // Return posts directly without Base64 transformation
        res.json(catPosts);
    } catch (error) {
        return next(new HttpError("Fetching category posts failed, please try again later.", 500));
    }
};


//============================== GET POSTS BY AUTHOR
// GET : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch posts by user and sort by newest first
        const posts = await Post.find({ creator: id }).sort({ createdAt: -1 });

        // Return posts directly without Base64 transformation
        res.json(posts);
    } catch (error) {
        return next(new HttpError("Fetching user posts failed, please try again later.", 500));
    }
};






//============================== EDIT POST
// PATCH : api/posts/:id
// PROTECTED
const editPost = async (req, res, next) => {
    try {
        const postID = req.params.id;
        const { title, category, description } = req.body;

        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill all fields", 422));
        }

        // Get the old post from the database
        const oldPost = await Post.findById(postID);
        if (!oldPost) {
            return next(new HttpError("Post not found", 404));
        }

        // Check if the logged-in user is the owner of the post
        if (req.user.id !== oldPost.creator.toString()) {
            return next(new HttpError("Unauthorized to update this post.", 403));
        }

        let imageURL = oldPost.imageURL; // Keep existing image if no new one is uploaded

        // Check if a new image is uploaded
        if (req.files && req.files.thumbnail) {
            const { thumbnail } = req.files;

            // Check file size
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail too big. Should be less than 2MB"));
            }

            // Upload new image to Cloudinary
            const uploadedImage = await cloudinary.uploader.upload(thumbnail.tempFilePath, {
                folder: "post_thumbnails",
                public_id: `thumbnail_${Date.now()}`,
                overwrite: true,
            });

            imageURL = uploadedImage.secure_url; // Update with new Cloudinary URL

            // Delete old Cloudinary image if it exists
            if (oldPost.imageURL) {
                const oldImagePublicId = oldPost.imageURL.split('/').pop().split('.')[0]; // Extract public ID
                await cloudinary.uploader.destroy(`post_thumbnails/${oldImagePublicId}`);
            }
        }

        // Update the post with new data
        const updatedPost = await Post.findByIdAndUpdate(
            postID,
            { title, category, description, imageURL },
            { new: true }
        );

        if (!updatedPost) {
            return next(new HttpError("Couldn't update post", 400));
        }

        res.json(updatedPost);
    } catch (error) {
        return next(new HttpError(error.message || "Server error"));
    }
};





//============================== DELETE POST
// DELETE : api/posts/:id
// PROTECTED
const removePost = async (req, res, next) => {
    try {
        const postID = req.params.id;

        if (!postID) {
            return next(new HttpError("Post unavailable", 400));
        }

        // ✅ Fetch the post
        const post = await Post.findById(postID);
        if (!post) {
            return next(new HttpError("Post not found", 404));
        }

        // ✅ Check if the logged-in user is the owner
        if (req.user.id !== post.creator.toString()) {
            return next(new HttpError("Unauthorized to delete this post.", 403));
        }

        // ✅ Delete the image from Cloudinary if it exists
        if (post.imageURL) {
            try {
                const oldImagePublicId = post.imageURL.split('/').pop().split('.')[0]; // Extract public ID
                await cloudinary.uploader.destroy(`post_thumbnails/${oldImagePublicId}`);
            } catch (cloudinaryError) {
                console.error("❌ Error deleting image from Cloudinary:", cloudinaryError);
            }
        }

        // ✅ Delete the post from MongoDB
        const deletedPost = await Post.findByIdAndDelete(postID);
        if (!deletedPost) {
            return next(new HttpError("Failed to delete post from database.", 500));
        }

        // ✅ Decrease the user's post count (Ensure it doesn't go below 0)
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { posts: -1 } }, // ✅ Decrement `posts` by 1
            { new: true }
        );

        if (!updatedUser) {
            return next(new HttpError("Post deleted, but user post count update failed.", 500));
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("❌ Error in removePost:", error);
        return next(new HttpError(error.message || "Failed to delete post", 500));
    }
};



module.exports = {getPosts, getPost, getCatPosts, getUserPosts, createPost, editPost, removePost}
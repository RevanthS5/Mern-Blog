const Post = require('../models/postModel')
const User = require('../models/userModel')
const path = require('path')
const fs = require('fs')
const { v4: uuid } = require("uuid")
const HttpError = require('../models/errorModel')
const { mongoose } = require('mongoose')
const buffer =  require('base64-arraybuffer');


//============================== CREATE NEW POST
// POST : api/posts/
// PROTECTED
const createPost = async (req, res, next) => {
    try {
        let {title, category, description} = req.body;
        if(!title || !category || !description || !req.files) {
            return next(new HttpError("Fill in all fields and choose thumbnail.", 422))
        }
        const {thumbnail} = req.files;
                const imageBuffer = Buffer.from(thumbnail.data, "base64");
        // check file size
        if(thumbnail.size > 2000000) {
            return next(new HttpError("Thumbnail too big. File size should be less than 2mb"))
        }

        // Generate a new filename
        let fileName = thumbnail.name;
        let newFilename = fileName.split(".")[0] + uuid() + "." + fileName.split(".").pop();
        
        // Save the file to Vercel's `/tmp` directory
        const filePath = path.join("/tmp", newFilename);
        await thumbnail.mv(filePath);

        // Convert image to Base64 (to store in MongoDB)

                // Save post in MongoDB
                const newPost = await Post.create({
                    title,
                    category,
                    description,
                    creator: req.user.id,
                    thumbnailImage: imageBuffer, // Store image as buffer
                });
        
                if (!newPost) {
                    return next(new HttpError("Something went wrong.", 422));
                }
        
                // Delete the temporary file after saving to MongoDB
                fs.unlinkSync(filePath);
        
                res.status(201).json(newPost);

        // thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
        //     if(err) {
        //         return next(new HttpError(err))
        //     } else {
        //         const newPost = await Post.create({title, category, description, creator: req.user.id, thumbnailImage: imageBuffer});
        //         if(!newPost) {
        //             return next(new HttpError("Something went wrong.", 422))
        //         }
        //         // Find user and increase posts count by 1
        //         const currentUser = await User.findById(req.user.id)
        //         const userPostCount = currentUser?.posts + 1;
        //         await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})

        //         res.status(201).json(newPost)
        //     }
        // })
    } catch (error) {
        console.log('Image upload fail')
        return next(new HttpError(error))
    }
}

//============================== Middleware function to decode the image
const decodeImage =  (posts) => {
    const transformedPosts = posts.map((post) => {
        const base64String = buffer.encode(post.thumbnailImage);
        newPost = {...post, base64String: base64String}
        return newPost
    })
    return transformedPosts
}


//============================== GET ALL POSTS
// GET : api/posts/
// UNPROTECTED
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({updatedAt: -1});
        const transformedPosts = decodeImage(posts)
        res.status(200).json(transformedPosts);
    } catch (error) {
        return next(new HttpError(error))
    }
}

const decodeImageForSinglePost =  (post) => {
        const base64String = buffer.encode(post.thumbnailImage);
        newPost = {...post, base64String: base64String}
    return newPost
}


//============================== GET SINGLE POSTS
// GET : api/posts/:id
// UNPROTECTED
const getPost = async (req, res, next) => {
    try {
        const postID = req.params.id;
        const post = await Post.findById(postID);
        if(!post) {
            return next(new HttpError("Post not found.", 404))
        }
        const transformedPost = decodeImageForSinglePost(post)
        res.status(200).json(transformedPost);
    } catch (error) {
        return next(new HttpError(error));
    }
}


//============================== GET POSTS BY CATEGORY
// GET : api/posts/categories/:category
// UNPROTECTED
const getCatPosts = async (req, res, next) => {
    try {
        const {category} = req.params;
        const catPosts = await Post.find({category}).sort({createdAt: -1})
        const transformedPosts = decodeImage(catPosts);
        res.json(transformedPosts)
    } catch (error) {
        return next(new HttpError(error))
    }
}


//============================== GET POSTS BY AUTHOR
// GET : api/posts/users/:id
// UNPROTECTED
const getUserPosts = async (req, res, next) => {
    const {id} = req.params;
    try {
        const posts = await Post.find({creator: id}).sort({createdAt: -1})
        const transformedPosts = decodeImage(posts);
        res.json(transformedPosts)
    } catch (error) {
        return next(new HttpError(error))
    }
}





//============================== EDIT POST
// PATCH : api/posts/:id
// PROTECTED
// const editPost = async (req, res, next) => {
//     let fileName;
//     let newFilename;
//     let updatedPost
//     try {
//         const postID = req.params.id;
//         let {title, category, description} = req.body;
//         // ReactQuill has a paragraph opening and closing tag with a break tag in between so there are 11 characters in there already. That's why 12 
//         if(!title || !category || description.length < 12) {
//             return next(new HttpError("Fill all fields", 422))
//         }
        
//         // get old post from db
//         const oldPost = await Post.findById(postID);

//         if(req.user.id == oldPost.creator) {
//             // update post without thumbnail
//             if(!req.files) {
//                 updatedPost = await Post.findByIdAndUpdate(postID, {title, category, description}, {new: true})
//             } else {
//                 // delete old thumbnail from uploads
//                 fs.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail), async (err) => {
//                 if (err) {
//                     return next(new HttpError(err))
//                 }})
                
//                 // upload new thumbnail
//                 const {thumbnail} = req.files;
//                 // check file size
//                 if(thumbnail.size > 2000000) {
//                     return next(new HttpError("Thumbnail too big. Should be less than 2mb"))
//                 }
//                 fileName = thumbnail.name;
//                 let splittedFilename = fileName.split('.')
//                 newFilename = splittedFilename[0] + uuid() + "." + splittedFilename[splittedFilename.length - 1]
//                 thumbnail.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
//                     if(err) {
//                         return next(new HttpError(err))
//                     }
//                 })
        
//                 updatedPost = await Post.findByIdAndUpdate(postID, {title, category, description, thumbnail: newFilename}, {new: true})
//             }
//         } else {
//             return next(new HttpError("Couldn't update post.", 403))
//         }

//         if(!updatedPost) {
//             return next(new HttpError("Couldn't update post", 400))
//         }
//         res.json(updatedPost)

//     } catch (error) {
//         return next(new HttpError(error))
//     }
// }


const editPost = async (req, res, next) => {
    try {
        const postID = req.params.id;
        let { title, category, description } = req.body;

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

        let updatedPost;

        // ✅ If there's NO new thumbnail, update text fields only
        if (!req.files) {
            updatedPost = await Post.findByIdAndUpdate(
                postID,
                { title, category, description },
                { new: true }
            );
        } else {
            // ✅ Delete old thumbnail if exists (from MongoDB, not filesystem)
            oldPost.thumbnailImage = null;

            // ✅ Upload new thumbnail
            const { thumbnail } = req.files;

            // Check file size
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail too big. Should be less than 2MB"));
            }

            // Generate a new filename
            let fileName = thumbnail.name;
            let newFilename =
                fileName.split(".")[0] + uuid() + "." + fileName.split(".").pop();

            // ✅ Save the file to Vercel's `/tmp/` directory
            const filePath = path.join("/tmp", newFilename);
            await thumbnail.mv(filePath);

            // Convert image to Buffer (for MongoDB)
            const imageBuffer = fs.readFileSync(filePath);

            // ✅ Update the post with the new thumbnail
            updatedPost = await Post.findByIdAndUpdate(
                postID,
                { title, category, description, thumbnailImage: imageBuffer },
                { new: true }
            );

            // ✅ Delete the temporary file after saving
            fs.unlinkSync(filePath);
        }

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
    const postID = req.params.id;
    if(!postID) {
        return next(new HttpError("Post unavailable"))
    }
    const post = await Post.findById(postID);
    const fileName = post?.thumbnail;
    if(req.user.id == post.creator) {
        // delete thumbnail from uploads
    fs.unlink(path.join(__dirname, '..', 'uploads', fileName), async (err) => {
        if (err) {
            return next(err)
        } else {
            await Post.findByIdAndDelete(postID)
            // Find user and reduce posts count by 1
            const currentUser = await User.findById(req.user.id)
            const userPostCount = currentUser?.posts - 1;
            await User.findByIdAndUpdate(req.user.id, {posts: userPostCount})
            res.json("Post deleted")
        }
        })
    } else {
        return next(new HttpError("Couldn't delete post.", 403))
    }
}

module.exports = {getPosts, getPost, getCatPosts, getUserPosts, createPost, editPost, removePost}
const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for Google users
    profileImage: { type: String, default: "https://res.cloudinary.com/dj1sakhgo/image/upload/v1738779346/default-profile-pic_mbukpq.png" }, 
    posts: { type: Number, default: 0 },
    isGoogleUser: { type: Boolean, default: false }});

module.exports = model('User', userSchema);

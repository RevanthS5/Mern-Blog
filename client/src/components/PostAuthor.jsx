import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

//  Replace with your Cloudinary default image URL
const DEFAULT_AVATAR = "https://res.cloudinary.com/dj1sakhgo/image/upload/v1738779346/default-profile-pic_mbukpq.png";

const PostAuthor = ({ authorID, createdAt }) => {
    const [author, setAuthor] = useState({});
    const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);

    useEffect(() => {
        const getAuthor = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorID}`);
                setAuthor(response?.data);

                //  Use Cloudinary profile image if available, otherwise fallback to default avatar
                setProfileImage(response?.data?.profileImage || DEFAULT_AVATAR);
            } catch (error) {
                console.error("Error fetching author:", error);
                setProfileImage(DEFAULT_AVATAR); // Fallback if API fails
            }
        };
        if (authorID) getAuthor();
    }, [authorID]);

    return (
        <Link to={`/posts/users/${authorID}`} className="post__author">
            <div className="post__author-avatar">
                <img src={profileImage} alt={author?.name || "User"} />
            </div>
            <div className="post__author-details">
                <h5>By: {author?.name || "Unknown"}</h5>
                <small>{new Date(createdAt).toLocaleDateString()}</small>
            </div>
        </Link>
    );
};

export default PostAuthor;

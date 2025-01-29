import React from 'react'
import { Link } from 'react-router-dom'
import PostAuthor from './PostAuthor'

const PostItem =  ({thumbnail, category, postID, title, description, authorID, createdAt, thumbnailImage}) => {
    const shortDescription = description.length > 145 ?description.substr(0, 145) + '...' : description;
    const postTitle = title.length > 30 ? title.substr(0, 30) + "..." : title;
    const imageData = `data:image/png;base64,${thumbnailImage}`
    return (
        <article className='post'>
            <div className="post__thumbnail">
                <img src={imageData} alt="Fetched from MongoDB" />
            </div>
            <div className="post__content">
                <Link to={`/posts/${postID}`}>
                    <h3>{postTitle}</h3>
                </Link>
                <p dangerouslySetInnerHTML={{__html: shortDescription}}/>
                <div className="post__footer">
                    <PostAuthor authorID={authorID} createdAt={createdAt} imageDataTrail={imageData}/>
                    <Link to={`/posts/categories/${category}`} className='btn category'>{category}</Link>
                </div>
            </div>
        </article>
    )
}

export default PostItem
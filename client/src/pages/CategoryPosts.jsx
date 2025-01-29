import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PostItem from '../components/PostItem'
import Loader from '../components/Loader'

const CategoryPosts = () => {
    const {category} = useParams()
    const [posts, setPosts] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true)
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/categories/${category}`)
                setPosts(response.data)
            } catch (error) {
                console.log(error)
            }
            setIsLoading(false)
        }
        fetchPosts();
    }, [category])

    if(isLoading) {
        return <Loader/>
    }

    return (
    <section className="category-posts">
        {posts.length ? <div className="container posts__container">
            {
                posts.map((element) => {
                    return <PostItem key={element._doc._id} postID={element._doc._id} thumbnail={element.base64String} category={element._doc.category} title={element._doc.title} description={element._doc.description} authorID={element._doc.creator} createdAt={element._doc.createdAt} thumbnailImage={element.base64String}/>
                })
            }
        </div>  : <h2 className="center">No Posts found for {category}.</h2>}
    </section>
    )
}


export default CategoryPosts
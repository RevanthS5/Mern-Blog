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
                    return <PostItem key={element._id} postID={element._id} thumbnail={element.imageURL} category={element.category} title={element.title} description={element.description} authorID={element.creator} createdAt={element.createdAt} thumbnailImage={element.imageURL}/>
                })
            }
        </div>  : <h2 className="center">No Posts found for {category}.</h2>}
    </section>
    )
}


export default CategoryPosts
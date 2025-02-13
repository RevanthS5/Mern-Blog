import React, { useContext, useEffect, useState } from 'react'
import PostItem from './PostItem'
import axios from 'axios'
import Loader from './Loader';
import Pagination from './Pagination'



const Posts = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(6);


  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts`);
        setPosts(response?.data)
      } catch (error) {
        console.log(error)
      }
      setIsLoading(false)
    }

    fetchPosts();
  }, [])


  if(isLoading) {
    return <Loader/>
  }

  // Pagination Tracking
  const lastPostIndex = currentPage * postsPerPage;
  const firstPostIndex = lastPostIndex - postsPerPage;
  const currentPosts = posts.slice(firstPostIndex, lastPostIndex)

  return (
      <section className="posts">
          {currentPosts.length ? <div className="container posts__container">
              {
                currentPosts.map((element) => <PostItem key={element._id} postID={element._id} thumbnail={element.imageURL} category={element.category} title={element.title} description={element.description} authorID={element.creator} createdAt={element.createdAt}/>)
              }
          </div> : <h2 className='center'>No Posts Found.</h2>}
          <Pagination 
            totalPosts={posts.length}
            postsPerPage={postsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
      </section>
  )
}

export default Posts
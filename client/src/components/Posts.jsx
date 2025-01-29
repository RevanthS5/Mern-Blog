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
                currentPosts.map((element) => <PostItem key={element._doc._id} postID={element._doc._id} thumbnail={element._doc.thumbnail} category={element._doc.category} title={element._doc.title} description={element._doc.description} authorID={element._doc.creator} createdAt={element._doc.createdAt} thumbnailImage={element.base64String}/>)
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
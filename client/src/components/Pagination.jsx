import React, { useState } from 'react'


const Pagination = ({totalPosts, postsPerPage, setCurrentPage, currentPage}) => {
    let pages = [];

    for(let i = 1; i <= Math.ceil(totalPosts/postsPerPage); i++){
        pages.push(i);
    }
  return (
    <>
    {
        totalPosts > postsPerPage ? (
            <div className='pagination'>
            {
                pages.map((page, index) => {
                    return (
                        <button key={index} onClick={() => setCurrentPage(page)} className={page == currentPage ? 'active': ''}> 
                            {page}
                        </button>
                    )
                })
            }
        </div>
        ) : null
    }
    </>
  )
}

export default Pagination
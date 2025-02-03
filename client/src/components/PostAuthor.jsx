import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ReactTimeAgo from "react-time-ago"
import TimeAgo from 'javascript-time-ago'

import en from 'javascript-time-ago/locale/en.json'
import ru from 'javascript-time-ago/locale/ru.json'
import { UserContext } from '../context/userContext'

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(ru)



const PostAuthor = ({authorID, createdAt, imageDataTrail}) => {


    const [author, setAuthor] = useState({})
    const [pic, setPic] = useState('Loading')
    useEffect(() => {
        const getAuthor = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/${authorID}`)
                setAuthor(response?.data)
                setPic(`data:image/jpg;base64,${response?.data?.base64String}`)
            } catch (error) {
                console.log(error)
            }
        }
        getAuthor();
    }, [])

    return (
        <Link to={`/posts/users/${authorID}`} className="post__author">
            <div className="post__author-avatar">
                {pic !== 'Loading' && <img src={pic} alt="Fetch" />}
            </div>
            <div className="post__author-details">
                <h5>By: {author?._doc?.name}</h5>
                <small><ReactTimeAgo date={new Date(createdAt)} locale="en-US" /></small>
            </div>
        </Link>
    )
}

export default PostAuthor
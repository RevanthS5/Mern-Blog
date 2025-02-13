import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import { UserContext } from '../context/userContext';

const CreatePost = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Uncategorized');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState(null); // ✅ Store file instead of Base64
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    const { currentUser } = useContext(UserContext);
    // const token = currentUser?.token;
    const token = localStorage.getItem('token');
    // Redirect to login page if no token
    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, []);

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline','strike', 'blockquote'],
            [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ];

    const POST_CATEGORIES = ["Deserts", "Healthy", "Indian", "Italian", "Vegan", "Easy", "Uncategorized", "Baking"];

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setThumbnail(file); // ✅ Store file directly
    };

    const createPost = async (e) => {
        e.preventDefault();

        const postData = new FormData();
        postData.append('title', title);
        postData.append('category', category);
        postData.append('description', description);
        postData.append('thumbnail', thumbnail); // ✅ Send file, not Base64

        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/posts`, postData, {
                withCredentials: true, 
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' // ✅ Ensure correct encoding
                }
            });

            if (response.status === 201) {
                return navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <section className="create-post">
            <div className="container">
                <h2>Create Post</h2>
                {error && <p className="form__error-message">{error}</p>}
                <form onSubmit={createPost} className='form create-post__form' encType="multipart/form-data">
                    <input type="text" placeholder='Title' value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                    <select name='category' value={category} onChange={e => setCategory(e.target.value)}>
                        {POST_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                    <ReactQuill modules={modules} formats={formats} value={description} onChange={setDescription} />
                    <input type="file" onChange={handleFileSelect} accept="image/png, image/jpg, image/jpeg" />
                    <button type="submit" className='btn primary'>Create</button>
                </form>
            </div>
        </section>
    );
};

export default CreatePost;

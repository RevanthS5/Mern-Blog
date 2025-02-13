import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { UserContext } from '../context/userContext';

const EditPost = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Uncategorized');
    const [description, setDescription] = useState('');
    const [thumbnail, setThumbnail] = useState(null); //  Store the new file
    const [existingThumbnail, setExistingThumbnail] = useState(''); //  Store the current image URL
    const [error, setError] = useState('');

    const params = useParams();
    const navigate = useNavigate();
    const { currentUser } = useContext(UserContext);
    const token = localStorage.getItem('token');

    // Redirect to login page if not authenticated
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

    //  Fetch Existing Post Data (including image URL)
    useEffect(() => {
        const getPost = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${params.id}`);
                setTitle(response?.data.title);
                setCategory(response?.data.category);
                setDescription(response?.data.description);
                setExistingThumbnail(response?.data.imageURL); // ✅ Store Cloudinary image URL
            } catch (error) {
                console.log(error);
                navigate('/login');
            }
        };
        getPost();
    }, []);

    //  Handle File Selection (Remove Base64 Conversion)
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        setThumbnail(file);
    };

    //  Send Updated Post Data
    const editPost = async (e) => {
        e.preventDefault();

        const postData = new FormData();
        postData.set('title', title);
        postData.set('category', category);
        postData.set('description', description);

        //  Add only if a new file is selected
        if (thumbnail) {
            postData.set('thumbnail', thumbnail);
        }

        try {
            const response = await axios.patch(`${process.env.REACT_APP_BASE_URL}/posts/${params.id}`, postData, {
                withCredentials: true, 
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                return navigate('/');
            }
        } catch (err) {
            console.log('Error detected:', err);
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <section className="create-post">
            <div className="container create-post__container">
                <h2>Edit Post</h2>
                {error && <p className="form__error-message">{error}</p>}
                <form onSubmit={editPost} className='form create-post__form' encType="multipart/form-data">
                    <input type="text" placeholder='Title' value={title} onChange={e => setTitle(e.target.value)} />
                    <select name='category' value={category} onChange={e => setCategory(e.target.value)}>
                        {POST_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                    <ReactQuill modules={modules} formats={formats} value={description} onChange={setDescription} />

                    {/*  Show Existing Image */}
                    {existingThumbnail && (
                        <div className="existing-thumbnail">
                            <p>Current Thumbnail:</p>
                            <img src={existingThumbnail} alt="Current Post" style={{ maxWidth: "100%", height: "auto" }} />
                        </div>
                    )}

                    {/*  Upload New Image */}
                    <input type="file" onChange={handleFileSelect} accept="image/png, image/jpg, image/jpeg" />

                    <button type="submit" className='btn primary'>Update</button>
                </form>
            </div>
        </section>
    );
};

export default EditPost;

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google'; // ✅ Import Google Login
import { jwtDecode } from "jwt-decode"; 
import { UserContext } from '../context/userContext';

const Register = () => {
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        password2: "",
    });

    const [profilePicture, setProfilePicture] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setCurrentUser } = useContext(UserContext);

    // ✅ Handle File Selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setProfilePicture(file);
        }
    };

    // ✅ Handle Input Changes
    const changeInputHandler = (e) => {
        setUserData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    // ✅ Register with Email & Password
    const registerUser = async (e) => {
        e.preventDefault();
        setError('');

        // ✅ Create FormData for image upload
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("password2", userData.password2);

        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/users/register`,
                formData,
                {
                    withCredentials: false,
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            // setCurrentUser(response.data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed.");
        }
    };

    // ✅ Register with Google OAuth
    const handleGoogleSignupSuccess = async (credentialResponse) => {
        try {
            // ✅ Decode Google JWT to extract user info
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("✅ Google Signup Data:", decoded);

            // ✅ Send Google Token to Backend for Registration/Login
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/google`, {
                token: credentialResponse.credential,
            });
            console.log('response', response)
            // ✅ Set user in context & redirect
            // setCurrentUser(response.data);
            navigate("/login");
        } catch (error) {
            console.error("❌ Google Signup Failed:", error);
        }
    };

    return (
        <section className="register">
            <div className="container">
                <h2>Sign Up</h2>
                <form onSubmit={registerUser} className='form register__form'>
                    {error && <p className='form__error-message'>{error}</p>}
                    <input type="text" placeholder='Full Name' name="name" value={userData.name} onChange={changeInputHandler} autoFocus />
                    <input type="email" placeholder='Email' name="email" value={userData.email} onChange={changeInputHandler} />
                    <input type="password" placeholder='Password' name="password" value={userData.password} onChange={changeInputHandler} />
                    <input type="password" placeholder='Confirm Password' name="password2" value={userData.password2} onChange={changeInputHandler} />

                    {/* ✅ File Upload for Profile Picture */}
                    <input 
                        type='file' 
                        placeholder='Upload Profile Picture' 
                        onChange={handleFileSelect}  
                        accept="image/png, image/jpg, image/jpeg" 
                    />  

                    <button type="submit" className='btn primary'>Register</button>
                </form>

                {/* ✅ Google Signup Button */}
                <div className="google-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSignupSuccess}
                        onError={() => console.log("❌ Google Signup Failed")}
                    />
                </div>

                <small>Already have an account? <Link to="/login">Sign in</Link></small>
            </div>
        </section>
    );
};

export default Register;

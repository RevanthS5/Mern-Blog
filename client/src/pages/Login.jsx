import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { UserContext } from '../context/userContext';
import { GoogleLogin } from '@react-oauth/google'; // ✅ Import Google Login
import { jwtDecode } from "jwt-decode"; 


const Login = () => {
    const [userData, setUserData] = useState({ email: "", password: "" });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setCurrentUser } = useContext(UserContext);

    const changeHandler = (e) => {
        setUserData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    };

    // ✅ Login with Email & Password
    const loginUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/login`, userData, {
                withCredentials: true, // ✅ Allow backend to set cookies
            });
    
            const { token, id, name } = response.data;
            console.log('response.data', response.data)
            
            // ✅ Store token manually for non-Google users
            localStorage.setItem("token", token);
            const userObject =  {
                '_id' : response.data.id,
                'name' : response.data.name
            };
            console.log('userObject', userObject)
            setCurrentUser(userObject);
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Login failed.");
        }
    };
    

    // ✅ Google Login Success
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            console.log("✅ Google Login Success:", credentialResponse);
    
            // ✅ Send the Google token to backend for verification
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/auth/google`,
                { token: credentialResponse.credential },
                { withCredentials: true } // ✅ Ensures cookies are sent
            );
            console.log('response.data', response.data)
            // ✅ Store user in context & localStorage
            setCurrentUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("token", response.data.token);
    
            // ✅ Redirect to homepage
            // window.location.href = "/";
        } catch (error) {
            console.error("❌ Google Login Failed:", error);
        }
    };
    
    
    
    
    return (
        <section className="login">
            <div className="container">
                <h2>Sign In</h2>
                <form onSubmit={loginUser} className='form login__form'>
                    {error && <p className="form__error-message">{error}</p>}
                    <input type="email" placeholder='Email' name='email' value={userData.email} onChange={changeHandler} autoFocus />
                    <input type="password" placeholder='Password' name='password' value={userData.password} onChange={changeHandler} />
                    <button type="submit" className='btn primary'>Login</button>
                </form>
                
                {/* ✅ Google Login Button */}
                <div className="google-login">
                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={() => console.log("❌ Google Login Failed")}
                    />
                </div>

                <small>Don't have an account? <Link to="/register">Sign up</Link></small>
            </div>
        </section>
    );
};

export default Login;

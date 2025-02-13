import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/userContext";

const AuthSuccess = () => {
    const { setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // ✅ Extract token from URL
    const token = searchParams.get("token");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!token) {
                    throw new Error("No token found");
                }

                // ✅ Store token in localStorage
                localStorage.setItem("token", token);

                // ✅ Fetch user details from backend using token
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userData = response.data;
                
                // ✅ Store user in context & localStorage
                setCurrentUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));

                // ✅ Redirect to homepage
                navigate("/");
            } catch (error) {
                console.error("OAuth Error:", error);
                navigate("/login");
            }
        };

        fetchUserData();
    }, [token, setCurrentUser, navigate]);

    return <h2>Processing login... Please wait.</h2>;
};

export default AuthSuccess;

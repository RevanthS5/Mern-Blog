import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        console.log("🔵 Running useEffect: Checking user authentication...");

        const checkUser = async () => {
            try {
                // ✅ Try getting the user from backend (Google login users rely on cookies)
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/users/me`, {
                    withCredentials: true, // ✅ Important for sending session cookies
                });

                const user = response.data; // ✅ Directly get user details
                console.log("✅ User Data Fetched:", user);

                // ✅ Check if token is available for manual login users
                const storedToken = localStorage.getItem("token");
                console.log('storedToken', storedToken)
                const userData = localStorage.getItem("user");
                console.log('userData', userData)
                if (storedToken) {
                    // ✅ Decode token to check expiration
                    const decoded = jwtDecode(storedToken);
                    const tokenExpiration = decoded.exp * 1000; // Convert to milliseconds

                    if (Date.now() >= tokenExpiration) {
                        console.log("🔴 Token expired! Logging out...");
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        setCurrentUser(null);
                        return;
                    }
                }

                // ✅ Store in localStorage only if it's a manual login user
                if (!user.isGoogleUser) {
                    localStorage.setItem("user", JSON.stringify(user));
                    localStorage.setItem("token", storedToken);
                }

                setCurrentUser(user);
            } catch (error) {
                console.error("🔴 Error Fetching User:", error);
                setCurrentUser(null);
            }
        };

        checkUser();
    }, []);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;


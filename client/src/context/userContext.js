import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const UserContext = createContext();

const extractUserData = (jsonString) => {
    try {
        // Parse the JSON string into an object
        const data = JSON.parse(jsonString);
        
        // Extract only the required fields
        const filteredData = {
            _id: data._id,
            name: data.name,
            profileImage: data.profileImage,
            posts: data.posts,
            isGoogleUser: data.isGoogleUser
        };

        return filteredData;
    } catch (error) {
        console.error(" Invalid JSON string:", error);
        return null;
    }
}


const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {

        const checkUser = async () => {
            try {
                const storedToken = localStorage.getItem("token");
                // ✅ Check if token is available for manual login user
                const userData = localStorage.getItem("user");
                const result = extractUserData(userData);
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
                setCurrentUser(result);
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


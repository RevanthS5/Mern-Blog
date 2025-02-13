import React, { useContext, useEffect } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { googleLogout } from "@react-oauth/google"; // ✅ Import Google Logout

const Logout = () => {
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const logoutUser = async () => {
            try {
                console.log("🔹 Logging out user:", currentUser);

                // ✅ 1. Revoke Google OAuth session (if applicable)
                if (currentUser?.isGoogleUser) {
                    console.log("🔹 Logging out from Google...");
                    googleLogout();
                }

                // ✅ 2. Call Backend Logout API (Clears Token Cookie)
                await axios.get(`${process.env.REACT_APP_BASE_URL}/auth/logout`, {
                    withCredentials: true,
                });

                // ✅ 3. Clear Local Storage & Context
                setCurrentUser(null);
                localStorage.removeItem("user");
                localStorage.removeItem("token");

                // ✅ 4. Clear Token Cookie (Extra Redundancy)
                document.cookie =
                    "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

                console.log("✅ User successfully logged out!");

                // ✅ 5. Redirect to login page after cleanup
                setTimeout(() => {
                    navigate("/login");
                }, 500);
            } catch (error) {
                console.error("❌ Logout Failed:", error);
            }
        };

        logoutUser();
    }, [currentUser, navigate, setCurrentUser]); // ✅ Runs only on mount

    return null; // ✅ No UI needed
};

export default Logout;

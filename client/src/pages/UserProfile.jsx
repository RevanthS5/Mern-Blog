import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiEdit } from "react-icons/fi";
import { BiCheck } from "react-icons/bi";
import { UserContext } from "../context/userContext";

//  Cloudinary Default Avatar URL
const DEFAULT_AVATAR =
  "https://res.cloudinary.com/dj1sakhgo/image/upload/v1738779346/default-profile-pic_mbukpq.png";

const UserProfile = () => {
  const [avatarTouched, setAvatarTouched] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR); // ✅ Stores Image URL (Cloudinary or Preview)
  const [selectedFile, setSelectedFile] = useState(null); // ✅ Stores the actual File object for upload

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const token = localStorage.getItem('token');
  const { id } = useParams();

  //  Redirect to login page if user is not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, []);

  // ✅ Fetch User Data
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const { name, email, profileImage } = response.data;
        setName(name);
        setEmail(email);
        setAvatar(profileImage || DEFAULT_AVATAR);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getUser();
  }, [id, token]);

  //  Handle File Selection (For Profile Picture)
  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file); //  Store file for upload
      setAvatar(URL.createObjectURL(file)); //  Show preview image before upload
      setAvatarTouched(true);
    } 
  };

  //  Upload Profile Picture to Cloudinary
  const changeAvatarHandler = async () => {

    if (!selectedFile) {
        return setError("Please select an image to upload.");
    }

    setAvatarTouched(false);

    try {

        const postData = new FormData();
        postData.append("profilePicture", selectedFile);

        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/change-avatar`, postData, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setAvatar(response.data.user.profileImage); 

        setSelectedFile(null);
    } catch (error) {
        setError(error.response?.data?.message || "Error updating avatar");
    }
};



  //  Update User Details (Name, Email, Password)
  const updateUserDetail = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        name,
        email,
        currentPassword,
        newPassword,
        confirmNewPassword,
        profileImage: avatar, // ✅ Use Cloudinary URL (NOT blob:)
      };


      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/users/edit-user`,
        userData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        navigate('/logout');
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error updating details");
    }
  };

  useEffect(() => {
    if(avatarTouched){
        changeAvatarHandler();
    }
  },[avatarTouched]);

  useEffect(() => {

    const getUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${id}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setName(response.data.name);
        setEmail(response.data.email);
        setAvatar(response.data.profileImage || DEFAULT_AVATAR);
      } catch (error) {
        console.error("Error Fetching User Details:", error);
      }
    };

    getUser();
  }, [id, token]);

  return (
    <section className="profile">
      <div className="container profile__container">
        <Link to={`/posts/users/${currentUser?.id}`} className="btn">
          My Posts
        </Link>

        <div className="profile__details">
          <div className="avatar__wrapper">
            <div className="profile__avatar">
              <img src={avatar} alt="User Avatar" />
            </div>
            {/*  Form to update avatar */}
            <form className="avatar__form">
              <input
                type="file"
                id="avatar"
                name="avatar"
                onChange={handleFileSelect}
                accept="image/png, image/jpg, image/jpeg"
              />
              <label htmlFor="avatar">
                <FiEdit />
              </label>
            </form>
            {avatarTouched && (
              <button
                type="submit"
                className="profile__avatar-btn"
                onClick={() => {
                  changeAvatarHandler();
                }}
              >
                <BiCheck />
              </button>
            )}
          </div>

          <h1>{name}</h1>

          {/*  Form to update user details */}
          <form className="form profile__form" onSubmit={updateUserDetail}>
            {error && <p className="form__error-message">{error}</p>}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <button type="submit" className="btn primary">
              Update my details
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;

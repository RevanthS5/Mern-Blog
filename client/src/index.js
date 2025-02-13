import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ Import Google Provider

import Layout from './components/Layout';
import Home from './pages/Home';
import ErrorPage from './pages/ErrorPage';
import PostDetail from './pages/PostDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import './index.css';
import CategoryPosts from './pages/CategoryPosts';
import AuthorPosts from './pages/AuthorPosts';
import UserProvider from './context/userContext';
import Logout from './pages/Logout';
import UserProfile from './pages/UserProfile';
import Authors from './pages/Authors';
import Dashboard from './pages/Dashboard';
import AuthSuccess from './pages/AuthSuccess'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <UserProvider><Layout/></UserProvider>,
    errorElement: <ErrorPage/>,
    children: [
      { index: true, element: <Home/> },
      { path: 'auth-success', element: <AuthSuccess/> },
      { path: 'posts/:id', element: <PostDetail/> },
      { path: 'register', element: <Register/> },
      { path: 'login', element: <Login/> },
      { path: 'profile/:id', element: <UserProfile/> },
      { path: 'authors', element: <Authors/> },
      { path: 'create', element: <CreatePost/> },
      { path: 'posts/:id/edit', element: <EditPost/> },
      { path: "posts/categories/:category", element: <CategoryPosts/> },
      { path: "posts/users/:id", element: <AuthorPosts/> },
      { path: "myposts/:id", element: <Dashboard/> },
      { path: "logout", element: <Logout/> }
    ]
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ✅ Wrap App with Google OAuth Provider */}
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <RouterProvider router={router}/>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import FullPost from './components/Posts/FullPost';

import MyPostsPage from './pages/MyPostsPage';
import { Container, CircularProgress, Box } from '@mui/material';
import { AppDispatch, RootState } from './store/store';
import { checkAuth } from './store/slices/authSlice';
import CreatePost from './components/Posts/CreatePost';
import MyProfile from './components/MyProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <Header />
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts/:id" element={<FullPost />} />
          
          {/* Защищенные маршруты */}

          <Route path="/my-posts" element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          } />
          <Route path="/create-post" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="/my-profile" element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

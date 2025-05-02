import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Header from './components/Header';
import FullPost from './components/Posts/FullPost';
import MyPostsPage from './pages/MyPostsPage';
import { Box, Container } from '@mui/material';
import { AppDispatch } from './store/store';
import { checkAuth, setAuthState } from './store/slices/authSlice';
import CreatePost from './components/Posts/CreatePost';
import MyProfile from './components/MyProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Проверяем наличие токена и данных пользователя в localStorage
    const token = localStorage.getItem('token');
    const userDataString = localStorage.getItem('userData');
    // Если оба существуют, считаем пользователя авторизованным
    // и тихо проверяем токен в фоновом режиме
    if (token && userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Если данные корректны, устанавливаем состояние авторизации
        if (userData) {
          // Синхронно устанавливаем isAuth: true и данные пользователя
          dispatch(setAuthState({
            isAuth: true,
            user: userData,
            token: token
          }));
          
          // И асинхронно проверяем актуальность токена
          dispatch(checkAuth());
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Если данные повреждены, очищаем localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      }
    }
  }, [dispatch]);

  return (
    <Box sx={{
      background: 'linear-gradient(135deg,rgb(226, 226, 226) 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
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
          <Route path="/create-post/:id/edit" element={
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
    </Box>
  );
}

export default App;

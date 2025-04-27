import { CircularProgress, Container, Typography } from "@mui/material";
import { AppDispatch, RootState } from "../../store/store";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { postApi } from "../../services/api";
import { Card, CardContent, CardHeader, CardMedia, Box, Button } from "@mui/material";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { deletePost } from "../../store/slices/postsSlice";
import { Post } from "../../types/types";
const API_URL = process.env.REACT_APP_API_URL;


const MyPosts = () => {
  const { user, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Добавляем сортировку постов
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Дополнительный эффект для отслеживания завершения проверки авторизации
  useEffect(() => {
    if (!authLoading) {
      // Даем небольшую задержку, чтобы убедиться, что состояние авторизации стабилизировалось
      const timer = setTimeout(() => {
        setAuthChecked(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  useEffect(() => {
    // Если все еще идет загрузка данных о пользователе или проверка еще не завершена, ждем
    if (authLoading || !authChecked) {
      return;
    }
    
    // Если пользователь не авторизован после загрузки, убираем индикатор загрузки
    if (!user) {
      setLoading(false);
      return;
    }

    const getUserPosts = async () => {
      try {
        setLoading(true);
        const response = await postApi.getUserPosts(user._id);
        setPosts(response);
      } catch (error) {
        console.error("Ошибка при получении постов пользователя:", error);
      } finally {
        setLoading(false);
      }
    }
    
    getUserPosts();
  }, [user, authLoading, authChecked, dispatch]);

  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    
    // Задаем имя облака
    const cloudName = "dpwwnhwbg"; // Имя вашего Cloudinary облака  
    
    // Если URL уже абсолютный (http/https)
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    } 

    // Если путь в формате /uploads/postlearn/filename или /uploads/filename
    if (imageUrl && imageUrl.includes('/uploads/')) {
        // Извлекаем имя файла
        const fileId = imageUrl.split('/').pop();
        if (!fileId) return ''; // Защита от ошибок 
        
        // Cloudinary URL с папкой postlearn
        const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/postlearn/${fileId}`;
        return cloudinaryUrl;
    }
    
    // Иначе добавляем API_URL
    return `${API_URL}${imageUrl}`;
  };
  

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Удалить пост?');
    if (!confirm) return;
    try {
      dispatch(deletePost(id));
      setPosts(posts.filter(post => post._id !== id));
    } catch (error) {
      console.error("Ошибка при удалении поста:", error);
    }
  }

  // Показываем загрузку если идет загрузка пользователя, проверка авторизации или загрузка постов
  if (authLoading || !authChecked || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если загрузка завершена и пользователя нет, показываем сообщение
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center">
          Пожалуйста, войдите в систему, чтобы просмотреть свои посты
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%'}}>
        <Button sx={{margin: 4, float: 'right'}} variant="contained" color="success"> 
          <RouterLink to="/create-post" style={{textDecoration: 'none', color: 'white'}}>
            Создать пост
          </RouterLink>
        </Button>
        
        {sortedPosts.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            У вас пока нет постов. Создайте свой первый пост!
          </Typography>
        ) : (
          sortedPosts.map((post) => (
            <Card sx={{ width: '100%', gap: 4, backgroundColor: '#fff2f2', marginBottom: 4 }} key={post._id}>
              <CardHeader
                title={post.title}
              />
              <CardMedia
                component="img"
                height="194"
                image={getImageUrl(post.imageUrl)}
                alt={post.title}
                crossOrigin="anonymous"
              />

              <CardContent>
                <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                  {post.text}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                  Автор: {post.user.fullName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                  Тэги: {post.tags.join(',')}
                </Typography>

                <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                  Просмотры: {post.viewsCount}
                </Typography>
              </CardContent>
              <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                  Кол-во лайков: {post.likesCount}
                </Typography>
              <Box sx={{margin: 2}}>
                <Button sx={{margin: 1}} variant="contained" color="error" onClick={() => handleDelete(post._id)}>Удалить</Button>
                <Button sx={{margin: 1}} variant="contained" color="success" onClick={()=> navigate(`/create-post/${post._id}/edit`)}>Редактировать</Button>
                <Button sx={{margin: 1}} variant="contained"> <RouterLink to={`/posts/${post._id}`} style={{textDecoration: 'none', color: 'white'}}>Открыть статью</RouterLink></Button>
              </Box> 
            </Card>
          ))
        )}
      </Box>
    </Container>  
  )
}

export default MyPosts; 

import { Container, Typography } from "@mui/material";
import { AppDispatch, RootState } from "../../store/store";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { postApi } from "../../services/api";
import { Card, CardContent, CardHeader, CardMedia, Box,  CardActions, IconButton, Button } from "@mui/material";
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { deletePost } from "../../store/slices/postsSlice";
import { Post } from "../../types/types";
const API_URL = process.env.REACT_APP_API_URL;


const MyPosts = () => {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate()

      // Добавляем сортировку постов
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  useEffect(() => {
    const getUserPosts = async () => {
      try {
        const response = await postApi.getUserPosts(user._id);
        setPosts(response);
      } catch (error) {
        console.log(error);
      }
    }
    getUserPosts();
  }, [isAuth, user, dispatch]);


  const handleDelete = (id: string) => {
    alert('Удалить пост?');
    try {
      dispatch(deletePost(id));
      setPosts(posts.filter(post => post._id !== id));

    } catch (error) {
     
    }
  }

  return (
    <Container maxWidth="lg">
    <Box sx={{ width: '100%'}}>
      <Button sx={{margin: 4, float: 'right'}} variant="contained" color="success"> <RouterLink to="/create-post" style={{textDecoration: 'none', color: 'white'}}>Создать пост</RouterLink></Button>
      {sortedPosts.length > 0 ? sortedPosts.map((post) => (
        <Card sx={{ width: '100%', gap: 4, backgroundColor: '#fff2f2', marginBottom: 4 }} key={post._id}>
          <CardHeader

            title={post.title}
          />
          <CardMedia
            component="img"
            height="194"
            image={`${API_URL}${post.imageUrl}`}
            alt={post.title}
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
      )): <Typography sx={{margin: 4}} variant="h6">Постов нет</Typography> }

    </Box>
    </Container>
  )
}

export default MyPosts; 

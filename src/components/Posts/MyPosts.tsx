import { Skeleton, Typography } from "@mui/material";
import { AppDispatch, RootState } from "../../store/store";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { postApi } from "../../services/api";
import { Card, CardContent, CardHeader, CardMedia, Box,  CardActions, IconButton, Button } from "@mui/material";
import { Link as RouterLink } from 'react-router-dom';
import { deletePost } from "../../store/slices/postsSlice";
import { Post } from "../../types/types";
const API_URL = process.env.REACT_APP_API_URL;



const PostSkeleton = () => (
  <Card sx={{ width: '100%', margin: 2, gap: 2 }}>
    <CardHeader
      avatar={<Skeleton variant="circular" width={40} height={40} />}
      title={<Skeleton variant="text" width={200} />}
      subheader={<Skeleton variant="text" width={140} />}
    />
    <Skeleton variant="rectangular" height={194} />
    <CardContent>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
    </CardContent>
    <CardActions disableSpacing>
      <Skeleton variant="circular" width={30} height={30} />
    </CardActions>
  </Card>
);

const MyPosts = () => {
  const { isAuth, user } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const dispatch = useDispatch<AppDispatch>();


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
  }, [isAuth, user]);


  const handleDelete = (id: string) => {
    alert('Удалить пост?');
    try {
      dispatch(deletePost(id));
      setPosts(posts.filter(post => post._id !== id));
      console.log('Пост удален');
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Box sx={{ width: '90%'}}>
      <Button sx={{margin: 4, float: 'right'}} variant="contained" color="success"> <RouterLink to="/create-post" style={{textDecoration: 'none', color: 'white'}}>Создать пост</RouterLink></Button>
      {posts.length > 0 ? posts.map((post) => (
        <Card sx={{ width: '100%', margin: 4, gap: 4, backgroundColor: '#fff2f2' }} key={post._id}>
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
              Просмотры: {post.viewsCount}
            </Typography>
          </CardContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
              Кол-во лайков: {post.likesCount}
            </Typography>
          <Box sx={{margin: 2}}>
            <Button sx={{margin: 1}} variant="contained" color="error" onClick={() => handleDelete(post._id)}>Удалить</Button>
            <Button sx={{margin: 1}} variant="contained" color="success">Редактировать</Button>
            <Button sx={{margin: 1}} variant="contained"> <RouterLink to={`/posts/${post._id}`} style={{textDecoration: 'none', color: 'white'}}>Открыть статью</RouterLink></Button>
          </Box> 
        </Card>
      )): <Typography sx={{margin: 4}} variant="h6">Постов нет</Typography> }

    </Box>
  )
}

export default MyPosts; 

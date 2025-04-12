import { Skeleton, Typography } from "@mui/material";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { postApi } from "../../services/api";
import { Card, CardContent, CardHeader, CardMedia, Box, CircularProgress, CardActions, IconButton, Link, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Navigate } from "react-router-dom";
import { Link as RouterLink } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

interface Post {
  _id: string;
  title: string;
  text: string;
  imageUrl: string;
  createdAt: string;
  viewsCount: number;
  user: {
    fullName: string;
  };
}

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserPosts = async () => {
      try {
        setLoading(true);
        const response = await postApi.getUserPosts(user._id);
        setPosts(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    getUserPosts();
  }, [isAuth, user]);

  console.log(isAuth)

  return (
    <Box sx={{ width: '90%' }}>
      {posts.map((post) => (
        <Card sx={{ width: '100%', margin: 4, gap: 4 }} key={post._id}>
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
          <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
           
            <IconButton aria-label="add to favorites">
              <FavoriteIcon />
            </IconButton>
          </CardActions>
          <Box sx={{margin: 2}}>
            <Button sx={{margin: 1}} variant="contained" color="error">Удалить</Button>
            <Button sx={{margin: 1}} variant="contained" color="success">Редактировать</Button>
            <Button sx={{margin: 1}} variant="contained"> <RouterLink to={`/posts/${post._id}`} style={{textDecoration: 'none', color: 'white'}}>Открыть статью</RouterLink></Button>
          </Box> 
        </Card>
      ))}
    </Box>
  )
}

export default MyPosts; 

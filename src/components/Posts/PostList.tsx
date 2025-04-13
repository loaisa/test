import { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { CardHeader, CardMedia, IconButton, Skeleton, Box, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../../store/slices/postsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Link as RouterLink } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const PostSkeleton = () => (
  <Card sx={{ width: '100%', marginBottom: 5, backgroundColor: '#fff2f2' }}>
    <CardHeader
      avatar={<Skeleton variant="circular" width={40} height={40} />}
      title={<Skeleton variant="text" width={200} />}
      subheader={<Skeleton variant="text" width={140} />}
    />
    <Skeleton variant="rectangular" height={194} />
    <CardContent>
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
    </CardContent>
    <CardActions disableSpacing>
      <Skeleton variant="circular" width={30} height={30} />
    </CardActions>
  </Card>
);

const PostList = () => {
    const { posts, loading } = useSelector((state: RootState) => state.posts); //получение posts и loading из store

    const dispatch = useDispatch<AppDispatch>(); //типизация dispatch 
    useEffect(() => {
        dispatch(fetchPosts()); //вызов fetchPosts
    }, []); 

    if (loading) {
      return (
        <Box sx={{ width: '100%' }}>
          {[1, 2, 3].map((item) => (
            <PostSkeleton key={item} />
          ))}
        </Box>
      );
    }

    return (
        <Box sx={{ width: '100%'}}>
            {posts.map((post) => (
              <Card sx={{ width: '100%', marginBottom: 5, backgroundColor: '#fff2f2' }} key={post._id}>
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
                        Дата создания: {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                        Автор: {post.user.fullName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>Тэги: {post.tags.join(', ')}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                        Просмотры: {post.viewsCount}
                      </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button sx={{margin: 1}} variant="contained"> <RouterLink to={`/posts/${post._id}`} style={{textDecoration: 'none', color: 'white'}}>Открыть статью</RouterLink></Button>
                      <IconButton aria-label="add to favorites">
                        <Box sx={{
                          '&:hover': {
                            '& .MuiSvgIcon-root': {
                              color: 'red'
                            }
                          }
                        }}>
                          <FavoriteIcon />
                        </Box>
                      </IconButton>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
}

export default PostList;
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { CardHeader, CardMedia, IconButton, Grid, Skeleton, Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../../store/slices/postsSlice';
import { AppDispatch, RootState } from '../../store/store';

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
        <Box sx={{ width: '100%' }}>
            {posts.map((post) => (
              <Card sx={{ width: '100%', margin: 4, gap: 4 }} key={post._id}>
                    <CardHeader
                      
                      title={post.title}
                    />
                    <CardMedia
                      component="img"
                      height="194"
                      image={post.image}
                      alt="Paella dish"
                    />
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                        {post.text}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', margin: 2 }}>
                        Автор: {post.author}
                      </Typography>
                    </CardContent>
                    <CardActions disableSpacing>
                      <IconButton aria-label="add to favorites">
                        <FavoriteIcon />
                      </IconButton>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
}

export default PostList;
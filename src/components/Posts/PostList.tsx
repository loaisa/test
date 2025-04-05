import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { CardHeader, CardMedia, IconButton, Grid, Skeleton, Box } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch } from 'react-redux';
import { fetchPosts } from '../../store/slices/postsSlice';
import { AppDispatch } from '../../store/store';

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
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
              <Card sx={{ width: '100%', margin: 2, gap: 2 }} key={post._id}>
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: "red" }} aria-label="recipe">
                          R
                        </Avatar>
                      }
                      title={post.title}
                      subheader={new Date(post.createdAt).toLocaleDateString()}
                    />
                    <CardMedia
                      component="img"
                      height="194"
                      image={post.image}
                      alt="Paella dish"
                    />
                    <CardContent>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {post.content}
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
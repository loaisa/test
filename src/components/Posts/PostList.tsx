import { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { CardHeader, CardMedia, IconButton, Skeleton, Box, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, togglePostLike } from '../../store/slices/postsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Link as RouterLink } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

// Добавим функцию для получения корректного URL изображения
const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    
    // Задаем имя облака
    const cloudName = "postlearn"; // Ваше имя облака в Cloudinary
    
    // Если URL уже абсолютный (http/https)
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    
    // Если путь в формате /uploads/postlearn/filename
    if (imageUrl && imageUrl.includes('/uploads/postlearn/')) {
        // Извлекаем имя файла
        const fileId = imageUrl.split('/').pop();
        if (!fileId) return ''; // Защита от ошибок
        
        // Формируем прямой URL Cloudinary без v1/
        const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${fileId}`;
        return cloudinaryUrl;
    }
    
    // Иначе добавляем API_URL
    return `${API_URL}${imageUrl}`;
};

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
    const { posts, loading } = useSelector((state: RootState) => state.posts);
    const { user } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch<AppDispatch>(); //типизация dispatch 
    useEffect(() => {
        dispatch(fetchPosts()); //вызов fetchPosts
    }, []); 

    const handleToggleLike = (postId: string) => {
        dispatch(togglePostLike(postId));
    }

    // Добавляем сортировку постов
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
            {sortedPosts.map((post) => (
              <Card sx={{ width: '100%', marginBottom: 5, backgroundColor: '#fff2f2',  }} key={post._id}>
                    <CardHeader
                      title={post.title}
                    />
                    <CardMedia
                      component="img"
                      height="194"
                      image={getImageUrl(post.imageUrl)}
                      alt={post.title}
                    />
                    <CardContent >
                      <Typography variant="body2" sx={{ color: '', margin: 2 }}>
                        {post.text}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '', margin: 2 }}>
                        Дата создания: {new Date(post.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '', margin: 2 }}>
                        Автор: {post.user.fullName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '', margin: 2 }}>Тэги: {post.tags.join(', ')}</Typography>
                      <Typography variant="body2" sx={{ color: '', margin: 2 }}>
                        Просмотры: {post.viewsCount}
                      </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'end' }}>
                    <Button sx={{margin: 1}} variant="contained"> 
                      <RouterLink to={`/posts/${post._id}`} style={{textDecoration: 'none', color: 'white'}}>
                        Открыть статью
                      </RouterLink>
                    </Button>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton 
                          aria-label="add to favorites" 
                          onClick={() => handleToggleLike(post._id)}
                          sx={{ 
                            '&:hover': {
                              '& .MuiSvgIcon-root': {
                                color: 'red'
                              }
                            }
                          }}
                        >
                          <FavoriteIcon sx={{ 
                            color: post.likedBy?.includes(user?._id) ? 'red' : 'inherit',
                            transition: 'color 0.3s ease'
                          }} />
                        </IconButton>
                        <Typography variant="body2" color="">
                          {post.likesCount || ''}
                        </Typography>
                      </Box>
                    </CardActions>
                </Card>
            ))}
        </Box>
    );
}

export default PostList;
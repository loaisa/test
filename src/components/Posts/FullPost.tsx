import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { postApi } from "../../services/api";
import { Card, CardContent, CardHeader, CardMedia, Typography, CircularProgress, Box, Container, IconButton } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store/store';
import { fetchOnePost, togglePostLike } from "../../store/slices/postsSlice";
import { Post } from "../../types/types";
import React from "react";


const API_URL = process.env.REACT_APP_API_URL;

const FullPost = React.memo(() => {
    const { id } = useParams<string>();
    const posts = useSelector((state: RootState) => state.posts.posts);
    const loading = useSelector((state: RootState) => state.posts.loading)
    const [error, setError] = useState<string | null>(null);
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    

    useEffect(() => {
        if (id) {
            dispatch(fetchOnePost(id)); // Диспатчим экшен для получения поста
        }
    }, [id, dispatch,]);

    const post = posts.find((p) => p._id === id); // Проверяем, что posts определен

    const handleToggleLike = (postId: string) => {
        dispatch(togglePostLike(postId));
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    if (!post) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography>Пост не найден</Typography>
            </Box>
        );
    }
    return (
        <Container maxWidth="md" sx={{ mt: 10 }}>
            <Card sx={{ padding: 2, backgroundColor: '#fff2f2'}}>
                <CardHeader
                    title={post.title}
                    subheader={new Date(post.createdAt).toLocaleDateString()}
                />
                <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img 
                        src={`${API_URL}${post.imageUrl}`} 
                        alt={post.title} 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                </Box>
                <CardContent>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {post.text}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Автор: {post.user.fullName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Просмотров: {post.viewsCount}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'end' }}>
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
                        <Typography variant="body2" color="text.secondary">
                          {post.likesCount || 0}
                        </Typography>
                      </Box>
                </CardContent>
            </Card>
        </Container>
    );
})

export default FullPost;

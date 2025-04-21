import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardMedia, Typography, CircularProgress, Box, Container, IconButton, CardActions, TextField, Button, Divider, List, ListItem, ListItemText, Avatar } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store/store';
import { fetchOnePost, togglePostLike } from "../../store/slices/postsSlice";
import React from "react";
import { Comment } from "../../types/types";

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
            <Card sx={{ padding: 2, backgroundColor: '#fff2f2', mb: 3 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
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
                          {post.likesCount || ''}
                        </Typography>
                      </Box>
                </CardContent>
            </Card>

        
            <Card sx={{ padding: 2, backgroundColor: '#fff2f2' }}>
                <Typography variant="h6" gutterBottom>
                    Комментарии ({post.comments?.length || 0})
                </Typography>

                {user && (
                    <Box component="form" onSubmit={()=>{}} sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            placeholder="Напишите комментарий..."
                            sx={{ mb: 2 }}
                        />
                        <Button 
                            type="submit" 
                            variant="contained" 
                        >
                            Отправить
                        </Button>
                    </Box>
                )}

                <Divider sx={{ mb: 2 }} />

                {post.comments && post.comments.length > 0 ? (
                    <List>
                        {post.comments.map((comment: Comment) => (
                            <React.Fragment key={comment._id}>
                                <ListItem alignItems="flex-start">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
                                                {comment.user.fullName.charAt(0)}
                                            </Avatar>
                                            <Typography variant="subtitle2" component="span">
                                                {comment.user.fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.primary">
                                            {comment.text}
                                        </Typography>
                                    </Box>
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        Пока нет комментариев. Будьте первым!
                    </Typography>
                )}
            </Card>
        </Container>
    );
})

export default FullPost;

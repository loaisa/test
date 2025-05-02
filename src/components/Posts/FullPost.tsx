import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Typography, CircularProgress, Box, Container, IconButton, TextField, Button, Divider, List, ListItem, ListItemText, Avatar, Paper } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store/store';
import { fetchOnePost, togglePostLike, addComment } from "../../store/slices/postsSlice";
import { Comment } from "../../types/types";
import { getImageUrl } from "../../utils/GetImageUrl";

// Выносим форму комментариев в отдельный компонент
const CommentForm = React.memo(({ postId, loading }: { postId: string, loading: boolean }) => {
    const [commentText, setCommentText] = useState<string>('');
    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim() || !postId) return;

        dispatch(addComment({ id: postId, text: commentText }));
        setCommentText(''); // Сразу очищаем поле ввода
    }, [postId, commentText, dispatch]);

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Напишите комментарий..."
                sx={{ 
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.95)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'white',
                        }
                    } 
                }}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={!commentText.trim() || loading}
                sx={{
                    borderRadius: 6,
                    padding: '10px 24px',
                    textTransform: 'none',
                    color: 'white !important',
                    fontWeight: 400,
                    background: 'linear-gradient(45deg,rgb(92, 92, 92) 90%,rgb(92, 92, 92) 90%)',
                    boxShadow: '0 3px 10px rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                        boxShadow: '0 6px 15px rgba(33, 150, 243, 0.4)',
                    }
                }}
            >
                Отправить комментарий
            </Button>
        </Box>
    );
});

// Компонент для отображения отдельного комментария
const CommentItem = React.memo(({ comment }: { comment: Comment }) => (
    <React.Fragment>
        <ListItem 
            alignItems="flex-start"
            sx={{ 
                py: 2,
                transition: 'background-color 0.3s',
                '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.01)'
                }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar 
                        sx={{ 
                            width: 36, 
                            height: 36, 
                            mr: 1.5, 
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        src={getImageUrl(comment.user.avatarUrl)}
                        imgProps={{ crossOrigin: "anonymous" }}
                    />
                    <Box>
                        <Typography 
                            variant="subtitle2" 
                            component="span" 
                            sx={{ fontWeight: 'bold', color: '#333' }}
                        >
                            {comment.user.fullName}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                                display: 'block',
                                fontSize: '0.7rem'
                            }}
                        >
                            {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
                <Typography 
                    variant="body2" 
                    color="text.primary"
                    sx={{ 
                        pl: 6.5,
                        lineHeight: 1.6
                    }}
                >
                    {comment.text}
                </Typography>
            </Box>
        </ListItem>
        <Divider component="li" sx={{ opacity: 0.6 }} />
    </React.Fragment>
));

// Компонент для отображения списка комментариев
const CommentsList = React.memo(({ comments }: { comments: Comment[] }) => (
    <List sx={{ p: 0 }}>
        {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
        ))}
    </List>
));

const FullPost = React.memo(() => {
    const { id } = useParams<string>();
    const posts = useSelector((state: RootState) => state.posts.posts);
    const loading = useSelector((state: RootState) => state.posts.loading);
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (id) {
            dispatch(fetchOnePost(id));
        }
    }, [id, dispatch]);

    const post = useMemo(() => posts.find((p) => p._id === id), [posts, id]);

    const handleToggleLike = useCallback((postId: string) => {
        dispatch(togglePostLike(postId));
    }, [dispatch]);

    if (loading && !post) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                mt: 10,
                height: '50vh' 
            }}>
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!post) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                mt: 10,
                height: '50vh' 
            }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        textAlign: 'center',
                        backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                >
                    <Typography variant="h5" gutterBottom>Пост не найден</Typography>
                    <Typography color="text.secondary">
                        Возможно, он был удален или у вас неверная ссылка
                    </Typography>
                </Paper>
            </Box>
        );
    }
    
    return (
        <Container maxWidth="md" sx={{ mt: { xs: 4, md: 8 }, mb: 6 }}>
            <Card 
                sx={{ 
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    mb: 4,
                    background: 'linear-gradient(to bottom, #fff8f8, #fff2f2)'
                }}
            >
                {/* Хедер поста с информацией об авторе */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 3,
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <Avatar
                        sx={{ 
                            width: 48, 
                            height: 48, 
                            mr: 2, 
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        src={getImageUrl(post.user.avatarUrl)}
                        imgProps={{ crossOrigin: "anonymous" }}
                    />
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {post.user.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {new Date(post.createdAt).toLocaleDateString()} · {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </Typography>
                    </Box>
                </Box>

                {/* Заголовок поста */}
                <Box sx={{ px: 3, pt: 2, pb: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        {post.title}
                    </Typography>

                    {/* Теги поста */}
                    {post.tags && post.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {post.tags.map(tag => (
                                <Typography 
                                    key={tag} 
                                    variant="caption" 
                                    sx={{ 
                                        bgcolor: 'rgba(0,0,0,0.04)', 
                                        color: 'text.secondary',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 10,
                                        fontWeight: 500
                                    }}
                                >
                                    #{tag}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Изображение поста */}
                <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: { xs: '250px', sm: '400px', md: '500px' },
                    overflow: 'hidden',
                    mb: 2
                }}>
                    <img
                        src={getImageUrl(post.imageUrl)}
                        alt={post.title}
                        crossOrigin="anonymous"
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.8s ease',
                        }}
                    />
                </Box>

                {/* Содержимое поста */}
                <CardContent sx={{ px: 4, pb: 4 }}>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            lineHeight: 1.8, 
                            fontSize: '1.1rem', 
                            mb: 4,
                            color: '#333'
                        }}
                    >
                        {post.text}
                    </Typography>

                    {/* Статистика и действия */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderTop: '1px solid rgba(0,0,0,0.08)',
                        pt: 3,
                        mt: 3
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <VisibilityIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {post.viewsCount}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ChatBubbleOutlineIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                                <Typography variant="body2" color="text.secondary">
                                    {post.comments?.length || 0}
                                </Typography>
                            </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                aria-label="add to favorites"
                                onClick={() => handleToggleLike(post._id)}
                                sx={{
                                    transition: 'transform 0.3s',
                                    '&:hover': {
                                        transform: 'scale(1.15)',
                                    }
                                }}
                            >
                                <FavoriteIcon 
                                    sx={{
                                        color: post.likedBy?.includes(user?._id) ? 'red' : 'inherit',
                                        fontSize: 28,
                                        transition: 'color 0.3s, transform 0.3s',
                                        transform: post.likedBy?.includes(user?._id) ? 'scale(1.1)' : 'scale(1)',
                                    }} 
                                />
                            </IconButton>
                            <Typography 
                                variant="body2" 
                                fontWeight="bold"
                                sx={{ 
                                    ml: 0.5,
                                    minWidth: 20
                                }}
                            >
                                {post.likesCount || ''}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Секция комментариев */}
            <Card 
                sx={{ 
                    padding: 3, 
                    borderRadius: 3,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(to bottom, #fff8f8, #fff2f2)'
                }}
            >
                <Typography 
                    variant="h5" 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <ChatBubbleOutlineIcon sx={{ mr: 1 }} />
                    Комментарии ({post.comments?.length || 0})
                </Typography>

                {user ? (
                    <CommentForm postId={post._id} loading={loading} />
                ) : (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            borderRadius: 2
                        }}
                    >
                        <Typography>Войдите, чтобы оставить комментарий</Typography>
                    </Paper>
                )}

                <Divider sx={{ mb: 2 }} />

                {post.comments && post.comments.length > 0 ? (
                    <CommentsList comments={post.comments} />
                ) : (
                    <Box
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2
                        }}
                    >
                        <Typography variant="body1" color="text.secondary">
                            Пока нет комментариев. Будьте первым!
                        </Typography>
                    </Box>
                )}
            </Card>
        </Container>
    );
});

export default FullPost;

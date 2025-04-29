import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, Typography, CircularProgress, Box, Container, IconButton, TextField, Button, Divider, List, ListItem, ListItemText, Avatar } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
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
                sx={{ mb: 2 }}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={!commentText.trim() || loading}
            >
                {loading ? "Отправка..." : "Отправить"}
            </Button>
        </Box>
    );
});

// Компонент для отображения отдельного комментария
const CommentItem = React.memo(({ comment }: { comment: Comment }) => (
    <React.Fragment>
        <ListItem alignItems="flex-start">
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar 
                      sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}
                      src={getImageUrl(comment.user.avatarUrl)}
                      imgProps={{ crossOrigin: "anonymous" }}
                    />
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
));

// Компонент для отображения списка комментариев
const CommentsList = React.memo(({ comments }: { comments: Comment[] }) => (
    <List>
        {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
        ))}
    </List>
))

const FullPost = React.memo(() => {
    const { id } = useParams<string>();
    const posts = useSelector((state: RootState) => state.posts.posts);
    const loading = useSelector((state: RootState) => state.posts.loading)


    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (id) {
            dispatch(fetchOnePost(id)); // Диспатчим экшен для получения поста
        }
    }, [id, dispatch]);

    // Используем useMemo для нахождения поста
    const post = useMemo(() =>
        posts.find((p) => p._id === id),
        [posts, id]
    );

    const handleToggleLike = useCallback((postId: string) => {
        dispatch(togglePostLike(postId));
    }, [dispatch]);

    if (loading && !post) {  //Изменили условие загрузки - теперь если loading активен И поста ещё нет. Это позволяет не мигать лоадером при добавлении комментария.
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
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
                        src={getImageUrl(post.imageUrl)}
                        alt={post.title}
                        crossOrigin="anonymous"
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
                    <CommentForm postId={post._id} loading={loading} />
                )}

                <Divider sx={{ mb: 2 }} />

                {post.comments && post.comments.length > 0 ? (
                    <CommentsList comments={post.comments} />
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                        Пока нет комментариев. Будьте первым!
                    </Typography>
                )}
            </Card>
        </Container>
    );
});

export default FullPost;

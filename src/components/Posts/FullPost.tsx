import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { postApi } from "../../services/api";
import { Card, CardContent, CardHeader, CardMedia, Typography, CircularProgress, Box, Container } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL;

const FullPost = () => {
    const { id } = useParams<string>();
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!id) {
                    setError('ID поста не найден');
                    return;
                }
                setLoading(true);
                const response = await postApi.getOnePost(id);
                setPost(response);
            } catch (error) {
                console.error('Ошибка при загрузке поста:', error);
                setError('Не удалось загрузить пост');
            } finally {
                setLoading(false);
            }
        }
        fetchPost();
    }, [id]);

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
            <Card sx={{ padding: 2 }}>
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
                </CardContent>
            </Card>
        </Container>
    );
}

export default FullPost;

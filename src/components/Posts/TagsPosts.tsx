import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Paper } from '@mui/material';
import { postApi } from '../../services/api';
import PostList from '../Posts/PostList';
import { Post } from '../../types/types';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const TagPosts: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        if (tag) {
          const data = await postApi.getPostsByTag(tag);
          setPosts(data);
        }
      } catch (err) {
        console.error('Error fetching posts by tag:', err);
        setError('Не удалось загрузить посты с этим тегом');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [tag]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Typography variant="h5" color="error" sx={{ mt: 5 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 3, 
        mb: 4, 
        background: 'linear-gradient(to bottom, #fff8f8, #fff2f2)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)'
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          color: '#424242'
        }}
      >
        <LocalOfferIcon sx={{ mr: 1, fontSize: 32 }} />
        Посты с тегом: #{tag}
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          mt: 1, 
          color: 'text.secondary',
          fontSize: '1.1rem'
        }}
      >
        {posts.length > 0 
          ? `Найдено ${posts.length} ${posts.length === 1 ? 'пост' : posts.length > 1 && posts.length < 5 ? 'поста' : 'постов'}`
          : 'Посты с этим тегом не найдены'
        }
      </Typography>
    </Paper>
    
    {posts.length > 0 ? <PostList posts={posts} /> : null}
  </Container>
  );
};

export default TagPosts;
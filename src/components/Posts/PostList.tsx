import { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { CardHeader, CardMedia, IconButton, Skeleton, Box, Button, Avatar } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts, togglePostLike } from '../../store/slices/postsSlice';
import { AppDispatch, RootState } from '../../store/store';
import { Link as RouterLink } from 'react-router-dom';
import { Post } from '../../types/types';
import { getImageUrl } from '../../utils/GetImageUrl'
import { useNavigate } from 'react-router-dom';

const PostSkeleton = () => (
  <Card sx={{ width: '100%', marginBottom: 5, backgroundColor: '#fff2f2' }}>
    <CardHeader
      avatar={<Skeleton variant="circular" width={40} height={40} />}
      title={<Skeleton variant="text" width={200} />}
      subheader={<Skeleton variant="text" width={140} />}
    />
    <Skeleton variant="rectangular" height={250} />
    <CardContent >
      <Skeleton variant="text" height={30} />
      <Skeleton variant="text" height={30} />
      <Skeleton variant="text" height={30} />
      <Skeleton variant="text" height={30} width="60%" />
    </CardContent>

    <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
      <Skeleton sx={{ display: 'flex', justifyContent: 'end', height: 60, }} variant="text" width="20%" />
      <Skeleton variant="circular" width={30} height={30} />
    </CardActions>
  </Card>
);

// Добавляем интерфейс для пропсов
interface PostListProps {
  posts?: Post[];
  loading?: boolean;
}


const PostList = ({ posts: propPosts }: PostListProps) => {
  const { posts: storePosts, loading } = useSelector((state: RootState) => state.posts);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>(); //типизация dispatch 
  const navigate = useNavigate();
  const posts = propPosts || storePosts;

  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    } else {
      // Обновляем данные в фоновом режиме без показа скелетона
      dispatch(fetchPosts());
    }
  }, []);

  const handleToggleLike = (postId: string) => {
    dispatch(togglePostLike(postId));
  }
  const handleTagClick = (tag: string) => {
    navigate(`/tags/${tag}`);
  };
  // Добавляем сортировку постов
  const sortedPosts = [...posts].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (loading && posts.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        {[1, 2, 3].map((item) => (
          <PostSkeleton key={item} />
        ))}
      </Box>
    );
  }


  return (
    <Box sx={{ width: '100%', }}>
      {sortedPosts.map((post: Post) => (
        //карточка поста
        <Card
          sx={{
            width: '100%',
            marginBottom: 5,
            borderRadius: 3,
            overflow: 'hidden',
            transition: 'transform 0.3s, box-shadow 0.3s',
            boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
            },
            background: 'linear-gradient(to bottom,rgb(231, 231, 231),rgb(194, 194, 194))'
          }}
          key={post._id}
        >
          {/* блок с аватаром и заголовком поста */}
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Avatar
              sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}
              src={getImageUrl(post.user.avatarUrl)}
              imgProps={{ crossOrigin: "anonymous" }}
            />
            <CardHeader
              title={post.title}
            />
          </Box>
          {/* блок с изображением поста */}
          <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <CardMedia
              component="img"
              height="240"
              image={getImageUrl(post.imageUrl)}
              alt={post.title}
              sx={{
                transition: 'transform 0.6s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
            {/* блок с количеством просмотров поста */}
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              px: 2,
              py: 0.5,
              borderTopLeftRadius: 8
            }}>
              <Typography variant="caption">Просмотры: {post.viewsCount}</Typography>
            </Box>
          </Box>
          <CardContent >
            {/* блок с текстом поста */}
            <Typography variant="body2" sx={{ color: '', margin: 2 }}>
              {post.text}
            </Typography>
            {/* блок с датой создания поста */}
            <Typography variant="body2" sx={{ color: '', margin: 2 }}>
              Дата создания: {new Date(post.createdAt).toLocaleDateString()}
            </Typography>
            {/* блок с автором поста */}
            <Typography variant="body2" sx={{ color: '', margin: 2 }}>
              Автор: {post.user.fullName}
            </Typography>
            {/* блок с тегами поста */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2 }}>
              {post.tags.map(tag => (
                <Typography
                  key={tag}
                  variant="caption"
                  sx={{
                    bgcolor: 'rgba(131, 131, 131, 0.6)',
                    color: 'black',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 10,
                    fontWeight: 500,
                    fontSize: '1rem !important',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'white',
                      bgcolor: 'rgba(0,0,0,0.08)'
                    }
                  }}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </Typography>
              ))}
            </Box>
            {/* блок с кнопкой для перехода на страницу поста */}
          </CardContent>
          <CardActions disableSpacing sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1.5 }}>
            <Button
              variant="contained"
              component={RouterLink}
              to={`/posts/${post._id}`}
              sx={{
                borderRadius: 6,
                px: 2.5,
                background: 'linear-gradient(45deg,rgb(92, 92, 92) 30%,rgb(92, 92, 92) 90%)',
                boxShadow: '0 3px 10px rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                }
              }}
            >
              Читать статью
            </Button>
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
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

export default PostList;
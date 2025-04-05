import { useState, useEffect } from 'react';
import { postApi } from '../../services/api';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import { CardHeader, CardMedia, IconButton, Grid } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import FavoriteIcon from '@mui/icons-material/Favorite';



const PostList = () => {
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        postApi.getPosts().then((data) => {
            setPosts(data);
        });
        }, []); 

    return (
        <Grid container spacing={2}>
            {posts.map((post) => (
                    <Card sx={{ width: '100%', margin: 2 , gap: 2}}>
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
        </Grid>
    )
}

export default PostList;
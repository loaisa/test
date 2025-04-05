
import PostList from '../components/Posts/PostList';
import Container from '@mui/material/Container';
const MainPage = () => {

    return (
        <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <PostList />
        </Container>
    )
}

export default MainPage;
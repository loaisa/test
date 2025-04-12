import PostList from '../components/Posts/PostList';
import Container from '@mui/material/Container';
import TagsFilter from '../components/TagsFilter';
import { Box } from '@mui/material';

const MainPage = () => {
    
    return (
        <Container maxWidth="lg">
            <Box sx={{ 
                display: 'flex', 
                gap: 2,
                mt: 4
            }}>
                <Box sx={{ flexGrow: 1 }}>
                    <PostList />
                </Box>
                <Box sx={{ 
                    width: 300,
                    position: 'sticky',
                    top: 20,
                    height: 'fit-content'
                }}>
                    <TagsFilter />
                </Box>
            </Box>
        </Container>
    )
}

export default MainPage;
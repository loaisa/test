import PostList from '../components/Posts/PostList';
import Container from '@mui/material/Container';
import TagsFilter from '../components/TagsFilter';
import { Box } from '@mui/material';

const MainPage = () => {
    
    return (
        <Container maxWidth="lg" >
            <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, //На маленьких экранах блоки располагаются друг под другом
                gap: 2,
                mt: 4
            }}>
                <Box sx={{ 
                    order: { xs: 2, md: 1 }, //для маленьких экранов порядок блоков меняется
                    flexGrow: 1 
                }}>
                    <PostList />
                </Box>
                <Box sx={{ 
                    order: { xs: 1, md: 2 },
                    width: { xs: '100%', md: 300 },
                    position: { xs: 'static', md: 'sticky' }, 
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
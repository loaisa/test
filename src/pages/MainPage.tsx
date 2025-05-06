import PostList from '../components/Posts/PostList';
import Container from '@mui/material/Container';
import TagsFilter from '../components/TagsFilter';
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import '../App.css';
import debounce from 'lodash/debounce';

const MainPage = () => {

    const [scroll, setScroll] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null)

    const debouncedHandleScroll = debounce(() => {
        setScroll(window.scrollY);
    }, 300);

    const scrollTo = () => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        window.addEventListener("scroll", debouncedHandleScroll);
        return () => {
            window.removeEventListener("scroll", debouncedHandleScroll);
            debouncedHandleScroll.cancel();
        };
    }, []);

    console.log('Перерендекр')

    return (
        <Container maxWidth="lg" ref={containerRef}>
            <button
                className={scroll < 300 ? `visible` : `visible show`}
                onClick={scrollTo}
            >
                Go Up
            </button>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' }, //На маленьких экранах блоки располагаются друг под другом
                gap: 4,
                mt: 4
            }}>
                <Box sx={{
                    width: '100%',
                    order: { xs: 2, md: 1 }, //для маленьких экранов порядок блоков меняется
                    flexGrow: 1
                }}>
                    <PostList />
                </Box>
                <Box sx={{
                    order: { xs: 1, md: 2 },
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
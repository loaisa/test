import { useEffect, useState } from "react";
import { Paper, Typography, Chip, Stack, Card, Skeleton, CardContent, CardHeader, Button, Box, Divider } from "@mui/material";
import { postApi } from "../services/api";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useNavigate } from "react-router-dom";

interface Tag {
    name: string;
    count: number;
}

const TagsSkeleton = () => (
    <Paper sx={{ 
        p: 3, 
        borderRadius: 3,
        background: 'linear-gradient(to bottom, #fff8f8, #fff2f2)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        width: {xs: 'auto', md: '100%'},
        height: 'auto'
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
            <Skeleton variant="text" width={140} height={32} />
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={1.5} sx={{ mb: 2 }}>
            {[1, 2, 3, 4, 5].map((item) => (
                <Skeleton
                    key={item}
                    variant="rounded"
                    width="100%"
                    height={40}
                />
            ))}
        </Stack>
        
        <Skeleton 
            width={120} 
            height={36} 
        />
    </Paper>
);
const getTagColor = (count: number) => {
    if (count > 1) return 'linear-gradient(45deg,rgb(182, 182, 182)10%,rgb(199, 173, 248) 95%)';
    return 'linear-gradient(45deg, #d1c4e9 30%, #c5cae9 90%)';
}

const TagsFilter = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const navigate = useNavigate();

    const displayedTags = showAll ? tags : tags.slice(0, 5);

    useEffect(() => {
        if (tags.length === 0) {
            const fetchTags = async () => {
                try {
                    const response = await postApi.getTags();
                    
                setTags(response);
            } catch (error) {
                console.error('Error fetching tags:', error);
            } finally {
                setLoading(false);
            }
        };
            fetchTags();
        }else{
            setLoading(false);
        }
    }, []);

    const handleTagClick = (tag: string) => {
        navigate(`/tags/${tag}`);
    };

    if (loading) {
        return <TagsSkeleton />;
    }

    return (
        <Paper sx={{
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(to bottom, #fff8f8, #fff2f2)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
            },
            width: {xs: 'auto', md: '100%'}, //для маленьких экранов ширина блока не 100%
        }}>
            <Typography
                variant="h6"
                sx={{
                    mb: 2.5,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#424242'
                }}
            >
                <LocalOfferIcon sx={{ mr: 1 }} />
                Популярные теги
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={1.5} sx={{ mb: 2 }}>
                {displayedTags.map((tag) => (
                    <Chip
                        key={tag.name}
                        label={`#${tag.name} (${tag.count})`}
                        onClick={() => handleTagClick(tag.name)}
                        sx={{
                            py: 2.5,
                            background: getTagColor(tag.count),
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            borderRadius: '16px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: '0 5px 12px rgba(0,0,0,0.15)',
                            }
                        }}
                    />
                ))}
            </Stack>

            {tags.length > 5 && (
                <Button
                    onClick={() => setShowAll(!showAll)}
                    size="small"
                    variant="outlined"
                    sx={{
                        mt: 1.5,
                        borderRadius: 6,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, rgba(92, 92, 92, 0.1) 30%, rgba(92, 92, 92, 0.2) 90%)',
                        transition: 'all 0.3s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                        }
                    }}
                >
                    {showAll ? 'Свернуть' : 'Показать все'}
                </Button>
            )}
        </Paper>
    );
}

export default TagsFilter;
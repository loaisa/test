import { useEffect, useState } from "react";
import { Container, Paper, Typography, Box, Chip, Stack, CircularProgress } from "@mui/material";
import PostList from "../components/Posts/PostList";
import { postApi } from "../services/api";


    const TagsFilter = () => {
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Paper sx={{ p: 2, backgroundColor: '#fff2f2' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Популярные теги
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
                {tags.map((tag) => (
                    <Chip key={tag} label={tag} />
                ))}
            </Stack>
        </Paper>
    )
}

export default TagsFilter;

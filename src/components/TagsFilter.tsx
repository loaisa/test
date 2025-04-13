import { useEffect, useState } from "react";
import { Paper, Typography, Chip, Stack, Card, CardActions, Skeleton, CardContent, CardHeader } from "@mui/material";
import { postApi } from "../services/api";



const TagsSkeleton = () => (
    <Card sx={{ width: '100%', backgroundColor: '#fff2f2'}}>
      <CardHeader
        title={<Skeleton variant="text" width={200} />}
      />
      <CardContent sx={{ display: 'flex', alignItems: 'center'}}>
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
      </CardContent>
    </Card>
  );


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
        return <TagsSkeleton />;
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

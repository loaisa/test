import { useEffect, useState } from "react";
import { Paper, Typography, Chip, Stack, Card, CardActions, Skeleton, CardContent, CardHeader, Button, Box } from "@mui/material";
import { postApi } from "../services/api";

interface Tag {
    name: string;
    count: number;
}

const TagsSkeleton = () => (
    <Card sx={{ backgroundColor: '#fff2f2', width: '230px'}}>
      <CardHeader
        title={<Skeleton variant="text" />}
      />
      <CardContent sx={{ display: 'flex', alignItems: 'center'}}>
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
        <Skeleton sx={{ marginRight: 2 }} variant="text" width={40} height={40} />
      </CardContent>
    </Card>
);
const getTagColor = (count: number) => {
    if (count > 20) return '#ffcdd2';
    if (count > 10) return '#e1bee7';
    return '#d1c4e9';
}



const TagsFilter = () => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const displayedTags = showAll ? tags : tags.slice(0, 3);

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
        <Paper sx={{ p: 2, backgroundColor: '#fff2f2',  width: '200px'}}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Популярные теги
            </Typography>
            <Stack direction="row" spacing={1} gap={1} sx={{ 
                display: 'flex', 
                flexWrap: 'wrap',  // Это обеспечит перенос тегов на новую строку
                gap: 1,           // Отступы между тегами
                maxWidth: '100%'   // Убедимся, что контейнер не превышает родительскую ширину
            }}>
                {displayedTags.map((tag) => (
                    <Chip 
                        key={tag.name} 
                        label={`${tag.name} (${tag.count})`}
                        sx={{ 
          
                            backgroundColor: tag.count > 2 ? getTagColor(tag.count)  :  '#bababade'
                        }}
                        style={{
                            marginLeft:'0',
                        }}
                        onClick={()=>console.log(tag.name)}
                    />
                ))}
            </Stack>
            <Button onClick={() => setShowAll(!showAll)} size="small" sx={{ marginTop: 1}}>
                {showAll ? 'Свернуть' : 'Показать все'}
            </Button>
        </Paper>
    )
}

export default TagsFilter;
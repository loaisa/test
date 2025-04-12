import { useEffect } from 'react';
import { AppDispatch, RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { Box, Button, Paper, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';

const AddPost = () => {
    const dispatch = useDispatch<AppDispatch>();
    const {isAuth} = useSelector((state: RootState) => state.auth);

    

    return (
        <Grid container spacing={2} display="flex" justifyContent="center" marginTop={10}>
            <Box component={Paper} sx={{p: 3}}>
                <Typography variant="h6">Создание поста</Typography>
                <form>
                    <TextField
                        label="Название"
                        name="title"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        required
                        sx={{mb: 2}}
                    />
                    <TextField
                        label="Текст"   
                        name="text"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        multiline
                        rows={6}
                        required
                        sx={{mb: 2}}
                    />  
                    <TextField
                        label="Тэги"
                        name="tags"
                        fullWidth
                        margin="normal" 
                        variant="outlined"
                        required
                        sx={{mb: 2}}
                    />
                    <input type="file" name="image" accept="image/*" style={{display: 'none'}} id="image-upload" />
                    <label htmlFor="image-upload">
                        <Button
                            variant="contained"
                            color="primary"
                            component="span"
                            sx={{mt: 2}}
                        >
                            Загрузить изображение
                        </Button>
                    </label>
                    <Box sx={{mt: 2}}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{mt: 2}}
                        >
                            Создать пост
                        </Button>
                    </Box>
                </form>
            </Box>
        </Grid>
    )
}

export default AddPost; 

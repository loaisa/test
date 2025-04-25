import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Box, Avatar, Typography, Container, Button, styled } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useState } from 'react';

import { updateUserAvatar } from '../store/slices/authSlice';

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
const API_URL = process.env.REACT_APP_API_URL;

const MyProfile = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const dispatch = useDispatch<AppDispatch>();
    const [error, setError] = useState<string | null>(null)
    const [isEdit, setIsEdit] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
 
    console.log(avatarUrl)

    // Обработчик выбора файла - только создает превью, но не отправляет на сервер
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) { 
            const file = event.target.files[0];
            
            // Сохраняем файл для последующей отправки
            setSelectedFile(file);
            
            // Создаем превью сразу после выбора файла
            const fileUrl = URL.createObjectURL(file);  
            setPreviewUrl(fileUrl);
        }
    };
        // Отправка изображения на сервер при сохранении профиля
        const handleSaveProfile = async () => {
            if (selectedFile && user?._id) {
                try {
                    const formData = new FormData();
                    formData.append('image', selectedFile);
                    
                    // Отправляем изображение только при сохранении
                    const resultAction = await dispatch(updateUserAvatar({ userId: user._id, formData }));

                    // Получаем результат из action
                    if (updateUserAvatar.fulfilled.match(resultAction)) { //проверят состояние запроса
                        const result = resultAction.payload;

                        // Обновляем avatarUrl из ответа сервера 
                        if (result && result.url) {
                            setAvatarUrl(result.url);
                        }
                    }
                    
                    // Очищаем временное состояние
                    setSelectedFile(null);
                    
                    // Освобождаем blob URL
                    if (previewUrl && previewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                    }
                    
                    setIsEdit(false);
                    
                } catch (err: any) {
                    setError(err.message || 'Ошибка при обновлении аватара');
                }
            } else {
                // Если изображение не выбрано, просто закрываем режим редактирования
                setIsEdit(false);
            }
        };

    const getAvatarUrl = () => {
        // Если используется локальное превью (blob URL)
        if (previewUrl?.startsWith('blob:')) {
            return previewUrl; // возвращаем blob URL напрямую
        }
        
        // Если есть avatarUrl из состояния
        if (avatarUrl) {
            // Если avatarUrl уже blob URL, возвращаем его напрямую
            if (avatarUrl.startsWith('blob:')) {
                return avatarUrl;
            }
            // Иначе добавляем API_URL
            return `${API_URL}${avatarUrl}`;
        }
        
        // Если есть аватар пользователя
        if (user?.avatarUrl) {
            return `${API_URL}${user.avatarUrl}`;
        }
        
        // Нет URL
        return undefined;
    };

    return (
        <Container maxWidth="xl">
            
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', height: '50vh', marginTop: 5, backgroundColor: '#fff2f2' }} >
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>
                    <Avatar 
                        sx={{ width: 100, height: 100, margin: '0 auto' }} 
                        src={getAvatarUrl()} 
                    />
                    {isEdit &&                     
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                        >
                            Загрузить изображение
                            <VisuallyHiddenInput
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                            />
                        </Button>
                        {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                        
                    </Box>}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }} >
                    <Typography variant="h6">{user?.fullName}</Typography>
                    <Typography variant="body1">{user?.email}</Typography>
                    <Box sx={{margin: 2}}>      
                    <Button 
                        sx={{margin: 1}} 
                        variant="contained" 
                        color="success" 
                        onClick={() => isEdit ? handleSaveProfile() : setIsEdit(true)}
                    >
                        {isEdit? 'Сохранить' : 'Редактировать'}
                    </Button>        
                </Box> 
                </Box>

            </Box>

        </Container>
    )
}

export default MyProfile    

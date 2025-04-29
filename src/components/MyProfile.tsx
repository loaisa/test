import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { Box, Avatar, Typography, Container, Button, styled, IconButton, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useRef, useState } from 'react';

import { postApi } from '../services/api';
import { getImageUrl } from '../utils/GetImageUrl'
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

const MyProfile = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>('');

    const [error, setError] = useState<string | null>(null)
    const [isEdit, setIsEdit] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const dispatch = useDispatch<AppDispatch>(); //типизация dispatch 
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0); // Новое состояние для отслеживания прогресса
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Добавляем состояние для хранения URL загруженного изображения

    // Обработчик выбора файла - только создает превью, но не отправляет на сервер
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите файл изображения');
                return;
            }

            // Проверка размера...
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                setError('Размер файла не должен превышать 10MB');
                return;
            }

            // Сохраняем файл для последующей отправки
            setSelectedFile(file);

            // Создаем превью сразу после выбора файла
            const fileUrl = URL.createObjectURL(file);
            setAvatarUrl(fileUrl);
        }
    };
    const handleUploadImage = async () => {
        if (selectedFile && user?._id) {

            try {

                setIsLoading(true);
                setUploadProgress(0);
                // Запускаем симуляцию прогресса
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => {
                        // Максимум 90% до завершения загрузки
                        if (prev >= 90) {
                            clearInterval(progressInterval);
                            return 90;
                        }
                        return prev + Math.floor(Math.random() * 5) + 1;
                    });
                }, 200)
                const formData = new FormData();
                formData.append('image', selectedFile);

                // Отправляем изображение на сервер

                const response = await dispatch(updateUserAvatar({
                    userId: user._id,
                    formData
                }))

                console.log(response)

                if (response.payload.url) {
                    // Очищаем интервал и устанавливаем 100%
                    clearInterval(progressInterval);
                    // Если загрузка успешна, сохраняем URL изображения
                    setUploadProgress(100);
                    setTimeout(() => {
                        setUploadedImageUrl(response.payload.url);
                        setUploadProgress(0);
                    }, 500)
                    console.log('Изображение успешно загружено на сервер:', response.payload.url);
                    setError('')
                    setIsEdit(false);
                    return response.payload.url;
                } else {
                    throw new Error('Неверный формат ответа от сервера');
                }
            } catch (err: any) {
                setUploadProgress(0);
                console.error('Ошибка при загрузке изображения:', err);
                // Даже при ошибке загрузки на сервер, мы сохраняем превью
                // чтобы пользователь мог удалить его и попробовать снова
                setError(`Ошибка при загрузке на сервер: ${err.message || 'Неизвестная ошибка, попробуйте снова'}`);
                // Сбрасываем input при ошибке, чтобы пользователь мог выбрать тот же файл снова
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            // Если изображение не выбрано, просто закрываем режим редактирования
            setIsEdit(false);
        }
    }


    // Функция удаления загруженного изображения
    const handleDeleteImage = async () => {
        setIsLoading(true)
        setAvatarUrl('')
        setSelectedFile(null)
        try {
            if (uploadedImageUrl) {  // Если нет загруженного изображения, выходим
                let filename;

                // Проверяем, является ли URL URL-ом Cloudinary
                if (uploadedImageUrl.includes('cloudinary.com')) {
                    // Для Cloudinary URL извлекаем только имя файла без расширения
                    // URL вида: https://res.cloudinary.com/dpwwnhwbg/image/upload/v1745711870/postlearn/lmzyemoxefeeua89uspx.png
                    const parts = uploadedImageUrl.split('/');
                    // Получаем последнюю часть URL (lmzyemoxefeeua89uspx.png)
                    const lastPart = parts[parts.length - 1];
                    // Удаляем расширение файла
                    filename = lastPart.split('.')[0];

                    console.log('Extracting Cloudinary filename:', filename);
                } else {
                    // Для локальных URL извлекаем путь после /uploads/
                    filename = uploadedImageUrl.split('/uploads/').pop();
                    console.log('Extracting local filename:', filename);
                }

                console.log(filename)
                if (!filename) {
                    throw new Error('Неверный формат URL изображения');
                }

                // Удаляем изображение с сервера
                await postApi.deleteImage(filename);
            } else {
                console.log('URL файла на сервере отсутствует, пропускаем удаление с сервера');
            }


            // Очищаем состояния
            setUploadedImageUrl(null);  // Сбрасываем URL загруженного изображения

            setError('');  // Очищаем сообщения об ошибках
            setIsLoading(false)

            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Сбрасываем значение input
            }

        } catch (err: any) {
            console.error('Error deleting image:', err);
            setError(err.message || 'Ошибка при удалении изображения');
        }

    };
    // Функция для получения корректного URL изображения




    return (
        <Container maxWidth="xl">

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-around', height: '50vh', marginTop: 5, backgroundColor: '#fff2f2' }} >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                    <Avatar
                        sx={{ width: 100, height: 100, margin: '0 auto' }}
                        // src={getImageUrl(user.avatarUrl)}
                        src={isEdit ? avatarUrl : getImageUrl(user.avatarUrl)}
                        imgProps={{ crossOrigin: "anonymous" }}
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

                    {isEdit &&
                        <Box sx={{ mt: 2, mb: 2 }}>


                            {/* Индикатор прогресса загрузки */}
                            {isLoading && !uploadedImageUrl && (
                                <Box sx={{ width: '100%', mt: 2 }}>
                                    <Box sx={{
                                        height: 10,
                                        bgcolor: '#e0e0e0',
                                        borderRadius: 5,
                                        overflow: 'hidden'
                                    }}>
                                        <Box
                                            sx={{
                                                height: '100%',
                                                width: `${uploadProgress}%`,
                                                bgcolor: 'primary.main',
                                                transition: 'width 0.3s ease-in-out'
                                            }}
                                        />
                                    </Box>
                                    <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
                                        {uploadProgress}% загружено
                                    </Typography>
                                </Box>
                            )}

                            {uploadedImageUrl && (
                                <Box sx={{ mt: 2, position: 'relative' }}>
                                    {isLoading && <CircularProgress sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0
                                    }} />}
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            height: '25px',
                                            width: '25px',
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                            color: 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.7)'
                                            }
                                        }}
                                        onClick={handleDeleteImage}
                                    >
                                        X
                                    </IconButton>
                                </Box>
                            )}
                        </Box>}
                    <Box sx={{ display: 'flex' }}>
                        <Button
                            sx={{ margin: 1 }}
                            variant="contained"
                            color="success"
                            onClick={() => isEdit ? handleUploadImage() : setIsEdit(true)}
                        >
                            {isEdit ? 'Сохранить' : 'Редактировать'}
                        </Button>
                    </Box>
                </Box>

            </Box>

        </Container>
    )
}

export default MyProfile   

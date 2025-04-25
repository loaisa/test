import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { postApi } from '../../services/api'
import { AppDispatch } from '../../store/store';
import { fetchOnePost, updatePost } from "../../store/slices/postsSlice";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
  styled
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createPost } from '../../store/slices/postsSlice';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

// Стилизованный компонент для input type="file"
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

// Функция для получения корректного URL изображения
const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return '';
  
  // Задаем имя облака
  const cloudName = "postlearn"; // Ваше имя облака в Cloudinary
  
  // Если URL уже абсолютный (http/https)
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Если путь в формате /uploads/postlearn/filename
  if (imageUrl && imageUrl.includes('/uploads/postlearn/')) {
    // Извлекаем имя файла
    const fileId = imageUrl.split('/').pop();
    if (!fileId) return ''; // Защита от ошибок
    
    // Формируем прямой URL Cloudinary без v1/
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${fileId}`;
    return cloudinaryUrl;
  }
  
  // Иначе добавляем API_URL
  return `${API_URL}${imageUrl}`;
};

const CreatePost: React.FC = () => {

  const { id } = useParams()
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isEdit = Boolean (id)
  

  const navigate = useNavigate();
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // Добавляем состояние для хранения URL загруженного изображения
  const dispatch = useDispatch<AppDispatch>(); //типизация dispatch 

  const { control, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      title: '',
      text: '',
      tags: '',
      imageUrl: ''
    }
  });



  // Основная функция отправки формы
  const onSubmit = async (data: any) => {
    try {
      // Формируем объект данных поста
      const postData = {
        title: data.title,  // Заголовок поста
        text: data.text,    // Текст поста
        tags: data.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),   // Преобразуем строку тегов в массив, удаляем пробелы и пустые значения
        imageUrl: uploadedImageUrl || data.imageUrl  // URL изображения (если есть загруженное изображение, используем его, иначе берем из формы)
      };

      // Проверяем наличие изображения
      if (!postData.imageUrl) {
        setError('Пожалуйста, загрузите изображение');
        return; // Прерываем выполнение функции
      }

      const response = isEdit && id ? await dispatch(updatePost({id, data: postData })) : await dispatch(createPost(postData));

      // Проверка на rejected status
      if (response.meta.requestStatus === 'rejected') {
        setError((response.payload as any)?.message || 'Ошибка при создании поста');
        return;
      }

      // Очищаем форму только при успешном создании
      setValue('title', '');
      setValue('text', '');
      setValue('tags', '');
      setUploadedImageUrl(null);
      setPreviewUrl(null);
      setError('');

      // Перенаправляем только при успешном создании
      navigate('/my-posts');

    } catch (err: any) {
      setError(err.message || 'Ошибка при создании поста');
      console.error(err);
    }
  };

  // Функция загрузки изображения на сервер
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();  // Создаем объект FormData для отправки файла
    formData.append('image', file);   // Добавляем файл в FormData

    try {

      // Отправляем изображение на сервер
      const response = await postApi.uploadImage(formData);
    

      if (response && response.url) {
        // Если загрузка успешна, сохраняем URL изображения
        setUploadedImageUrl(response.url);
        setValue('imageUrl', response.url);
        return response.url;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Ошибка при загрузке изображения');
      throw err;
    }
  };

  // Обработчик изменения выбранного изображения
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) { // Проверяем, есть ли файлы в input
      const file = event.target.files[0];

      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, выберите файл изображения');
        return;
      }

      // Проверка размера файла (10MB = 10 * 1024 * 1024 bytes)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Размер файла не должен превышать 10MB');
        return;
      }

      const fileUrl = URL.createObjectURL(file);  // Создаем временный URL для превью
      setPreviewUrl(fileUrl);  // Устанавливаем URL превью
      try {
        // Загружаем изображение на сервер
        await handleImageUpload(file);
      } catch (err: any) {
        setError(err.message);  // Показываем ошибку пользователю
      }
    }
  };

  // Функция удаления загруженного изображения
  const handleDeleteImage = async () => {
    if (!uploadedImageUrl) return;  // Если нет загруженного изображения, выходим

    try {
      // Извлекаем имя файла из URL
      const filename = uploadedImageUrl.split('/uploads/').pop();
      if (!filename) {
        throw new Error('Неверный формат URL изображения');
      }

      // Удаляем изображение с сервера
      await postApi.deleteImage(filename);

      // Очищаем состояния
      setPreviewUrl(null);  // Удаляем превью
      setUploadedImageUrl(null);  // Сбрасываем URL загруженного изображения
      setValue('imageUrl', '');  // Очищаем поле URL изображения в форме
      setError('');  // Очищаем сообщения об ошибках
    } catch (err: any) {
      console.error('Error deleting image:', err);
      setError(err.message || 'Ошибка при удалении изображения');
    }
  };

  useEffect(() => {
    if (id) {
      const getPost = async () => {
        try {
          const post = await dispatch(fetchOnePost(id))
          setValue('title', post.payload.title)
          setValue('text', post.payload.text)
          setValue('tags', post.payload.tags.join(', '))
          setPreviewUrl(getImageUrl(post.payload.imageUrl))
          setUploadedImageUrl(post.payload.imageUrl) 
        } catch (err: any) {
          console.error('Ошибка получения поста:', err);
        }
      }
      getPost()
    }
  }, [id, dispatch])


  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Создать пост
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'Заголовок обязателен' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Заголовок"
              fullWidth
              margin="normal"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="text"
          control={control}
          rules={{ required: 'Текст поста обязателен' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Текст поста"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              placeholder='Не менее 10 символов'
              error={!!errors.text}
              helperText={errors.text?.message}
            />
          )}
        />

        <Controller
          name="tags"
          control={control}
          rules={{ required: 'Теги обязательны' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Теги (через запятую)"
              fullWidth
              margin="normal"
              error={!!errors.tags}
              helperText={errors.tags?.message}
            />
          )}
        />


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

          {previewUrl && (
            <Box sx={{ mt: 2, position: 'relative' }}>
              <img
                src={previewUrl}
                alt="Preview"
                crossOrigin="anonymous"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
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
        </Box>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"

          >
            {isEdit ? 'Сохранить' : 'Создать пост'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/my-posts')}
          >
            Отмена
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;

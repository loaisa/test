import React, { useState, useEffect, useRef } from 'react';
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
  styled,
  CircularProgress
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createPost } from '../../store/slices/postsSlice';
import { useNavigate, useParams } from 'react-router-dom';
import {getImageUrl} from '../../utils/GetImageUrl'



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

const CreatePost: React.FC = () => {

  const { id } = useParams()
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0); // Новое состояние для отслеживания прогресса
  const isEdit = Boolean(id)
  const [isLoading, setIsLoading] = useState(false)
  // Добавляем ref для input файла
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setIsLoading(true)
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
        setIsLoading(false)
        return; // Прерываем выполнение функции
      }

      const response = isEdit && id ? await dispatch(updatePost({ id, data: postData })) : await dispatch(createPost(postData));

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

      setError('');

      // Перенаправляем только при успешном создании
      navigate('/my-posts');

    } catch (err: any) {
      setError(err.message || 'Ошибка при создании поста');
      console.error(err);
    }
  };


  // Обработчик изменения выбранного изображения
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      try {
        // Проверки файла...
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

        // Загружаем на сервер
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
        }, 200);
        const formData = new FormData();  // Создаем объект FormData для отправки файла
        formData.append('image', file);   // Добавляем файл в FormData



        // Отправляем изображение на сервер
        const response = await postApi.uploadImage(formData);


        if (response && response.url) {
          // Очищаем интервал и устанавливаем 100%
          clearInterval(progressInterval);
          // Если загрузка успешна, сохраняем URL изображения
          setUploadProgress(100);
          setTimeout(() => {
            setUploadedImageUrl(response.url);
            setValue('imageUrl', response.url);
            setUploadProgress(0);
          }, 500)
          console.log('Изображение успешно загружено на сервер:', response.url);
          setError('')
          return response.url;
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
    }
  };
  // Функция удаления загруженного изображения
  const handleDeleteImage = async () => {
    setIsLoading(true)

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
      setValue('imageUrl', '');  // Очищаем поле URL изображения в форме
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

  useEffect(() => {
    if (id) {
      const getPost = async () => {
        try {
          const post = await dispatch(fetchOnePost(id))
          setValue('title', post.payload.title)
          setValue('text', post.payload.text)
          setValue('tags', post.payload.tags.join(', '))
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
          rules={{ required: 'Текст поста обязателен', minLength: { value: 10, message: 'Текст поста должен содержать не менее 10 символов' } }}
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
          {/* Кнопка загрузки с состоянием загрузки */}
          <Button
            component="label"
            variant="contained"
            startIcon={!isLoading ? <CloudUploadIcon /> : null}
            disabled={isLoading}
            sx={{ position: 'relative' }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress
                  size={24}
                  sx={{ mr: 1, color: 'white' }}
                />
                Загрузка...
              </Box>
            ) : (
              'Загрузить изображение'
            )}
            <VisuallyHiddenInput
              ref={fileInputRef}
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              disabled={isLoading}
            />
          </Button>

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
              <img
                src={getImageUrl(uploadedImageUrl)}
                alt="Preview"
                crossOrigin="anonymous"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain'
                }}
              />
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
            disabled={isLoading}
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

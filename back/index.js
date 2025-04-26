import 'dotenv/config';
import express from 'express'; // импортируем для создания сервера
import mongoose from 'mongoose'; // импортируем для подключения к MongoDB
import cors from 'cors'; // импортируем для обработки CORS
import { registerValidation, loginValidation, postCreateValidationValidation } from './validations/validations.js' // импортируем для валидации
import { register, login, getMe, getOneUser, updateImageUser } from './controllers/UserController.js' // импортируем для регистрации и авторизации   
import { createPost, getAll, getOne, remove, update, getUserPosts, getTags, toggleLike, addComment } from './controllers/PostController.js' // импортируем для создания, получения, удаления и обновления постов
import checkAuth from './utils/checkAuth.js' // импортируем для проверки авторизации
import multer from 'multer' // импортируем для загрузки изображений
import { validationErrors } from './utils/VallidationErros.js' // импортируем для проверки валидации
import path from 'path'; // импортируем для работы с путями

import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({ storage });

const app = express(); //создали сервер

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); //для работы с путями в ES модулях

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
}); //Подключились к MongoDB    

const PORT = process.env.PORT || 3001;

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
}); //Запустили сервер на порту 

// Заменяем на более детальную конфигурацию
// Добавляем явные заголовки CORS перед middleware
app.use((req, res, next) => {
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        'https://friends-posts.netlify.app',
        'http://localhost:3000'
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// А затем используем cors middleware как дополнительный слой защиты
app.use(cors({
    origin: true,  // Разрешить все origin, мы уже фильтруем выше
    credentials: true
}));




app.use(express.json()); //Сделали так, чтобы можно было принимать json в запросах
app.use('/uploads', express.static('uploads'))  //если придёт запрос на /uploads, то отдаём файлы из папки uploads

app.post('/uploads', checkAuth, (req, res) => {
  console.log('Получен запрос на загрузку файла');
  
  // Проверяем, есть ли файл в запросе
  if (!req.files && !req.file && (!req.body || !req.body.image)) {
    console.log('Файл отсутствует в запросе:', req.body);
    return res.status(400).json({ message: 'Файл не найден в запросе' });
  }

  upload.single('image')(req, res, function(err) {
    if (err) {
      console.error('Ошибка Multer при загрузке файла:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: 'Файл слишком большой',
          error: err.message,
          code: err.code
        });
      }
      return res.status(500).json({ 
        message: 'Ошибка при загрузке файла', 
        error: err.message,
        code: err.code
      });
    }
    
    // Проверяем успешность загрузки
    if (!req.file) {
      console.error('Файл не был загружен после обработки Multer');
      return res.status(400).json({ message: 'Файл не был загружен' });
    }
    
    // Логирование деталей загруженного файла
    console.log('Файл загружен на Cloudinary:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename,
      public_id: req.file.public_id
    });
    
    // Проверка структуры полей Cloudinary
    const cloudinaryUrl = req.file.path || req.file.secure_url || req.file.url;
    console.log('Итоговый URL для отправки клиенту:', cloudinaryUrl);
    
    // Успешный ответ
    res.json({
      url: cloudinaryUrl, // Используем наиболее подходящее поле для URL
      filename: req.file.filename || req.file.public_id,
      publicId: req.file.public_id,
      original: {
        url: cloudinaryUrl,
        public_id: req.file.public_id,
        format: req.file.format
      }
    });
  });
});

// Эндпоинт для удаления изображения
app.delete('/uploads/:filename', checkAuth, async (req, res) => {
    try {
      let filename = req.params.filename;
      console.log('Получен запрос на удаление файла:', filename);
      
      // Очищаем имя файла от возможных лишних символов и путей
      if (filename.includes('/')) {
        const parts = filename.split('/');
        filename = parts[parts.length - 1];
      }
      
      // Убираем расширение файла, если оно есть
      if (filename.includes('.')) {
        filename = filename.split('.')[0];
      }
      
      console.log('Очищенное имя файла для удаления:', filename);
      
      // Пробуем разные варианты public_id для удаления файла
      let result = null;
      const possibleIds = [
        filename,                    // просто имя файла
        `uploads/${filename}`,       // имя файла в папке uploads
        `${process.env.CLOUDINARY_CLOUD_NAME}/${filename}` // имя файла с именем облака
      ];
      
      console.log('Попытка удаления файла с различными вариантами public_id:', possibleIds);
      
      // Перебираем все возможные варианты public_id
      for (const publicId of possibleIds) {
        try {
          console.log('Пробуем удалить с publicId:', publicId);
          const attemptResult = await cloudinary.uploader.destroy(publicId);
          console.log('Результат попытки:', attemptResult);
          
          if (attemptResult.result === 'ok') {
            result = attemptResult;
            console.log('Успешно удален файл с publicId:', publicId);
            break;
          }
        } catch (error) {
          console.log('Ошибка при попытке удаления с publicId:', publicId, error.message);
        }
      }
      
      if (result && result.result === 'ok') {
        res.json({ message: 'Файл успешно удален' });
      } else {
        res.status(404).json({ 
          message: 'Файл не найден или не может быть удален', 
          attempts: possibleIds,
          publicId: filename
        });
      }
    } catch (err) {
      console.error('Error deleting file from Cloudinary:', err);
      res.status(500).json({ 
        message: 'Ошибка при удалении файла', 
        error: err.message,
        publicId: req.params.filename 
      });
    }
});

// если придёт запрос на /uploads, то отдаём файлы из папки uploads

app.post('/auth/login', loginValidation, validationErrors, login); //проверяем валидацию и логиним пользователя и отправляем ошибки
app.post('/auth/register', registerValidation, validationErrors, register) //проверяем валидацию и регистрируем пользователя и отправляем ошибки
app.get('/auth/me', checkAuth, getMe) //проверяем авторизацию и получаем информацию о пользователе
app.get('/users/:id', getOneUser) //получаем одного пользователя по id
app.patch('/users/:id/update-image', checkAuth, upload.single('image'), updateImageUser);//обновляем изображение пользоветеля по id
app.get('/posts/tags', getTags) //получаем все теги

app.get('/posts', getAll) //получаем все посты
app.get('/posts/user/:id', checkAuth, getUserPosts) //получаем посты пользователя по id
app.get('/posts/:id', getOne) //получаем один пост по id
app.post('/posts/:id/like', checkAuth, toggleLike) //лайкаем пост по id
app.post('/posts', checkAuth, postCreateValidationValidation, validationErrors, createPost) //проверяем авторизацию и валидацию поста, статью нельзя создать без авторизации и отправляем ошибки
app.delete('/posts/:id', checkAuth, remove) //удаляем пост по id
app.patch('/posts/:id', checkAuth, postCreateValidationValidation, validationErrors, update) //обновляем пост по id
app.post('/posts/:id/comment', checkAuth, addComment) //добавляем комментарий к посту


// Добавляем обработчик для корневого маршрута
app.get('/', (req, res) => {
    res.json({ 
      message: 'Добро пожаловать в API PostLearn',
      status: 'online',
      endpoints: {
        auth: ['/auth/login', '/auth/register', '/auth/me'],
        posts: ['/posts', '/posts/:id', '/posts/user/:id', '/posts/:id/like', '/posts/:id/comment'],
        tags: ['/posts/tags'],
        uploads: ['/uploads']
      }
    });
  });
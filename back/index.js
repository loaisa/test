import 'dotenv/config';
import express from 'express'; // импортируем для создания сервера
import mongoose from 'mongoose'; // импортируем для подключения к MongoDB
import cors from 'cors'; // импортируем для обработки CORS
import { registerValidation, loginValidation, postCreateValidationValidation } from './validations/validations.js' // импортируем для валидации
import { register, login, getMe, getOneUser, updateImageUser } from './controllers/UserController.js' // импортируем для регистрации и авторизации   
import { createPost, getAll, getOne, remove, update, getUserPosts, getTags, toggleLike, addComment, getPostsByTag } from './controllers/PostController.js' // импортируем для создания, получения, удаления и обновления постов
import checkAuth from './utils/checkAuth.js' // импортируем для проверки авторизации
import multer from 'multer' // импортируем для загрузки изображений
import { validationErrors } from './utils/VallidationErros.js' // импортируем для проверки валидации
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
      folder: 'postlearn',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({ storage });

const app = express(); //создали сервер



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

app.post('/uploads', checkAuth, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
    }
    console.log('Uploaded file to Cloudinary - FULL DETAILS:', JSON.stringify(req.file, null, 2));
    
    // Проверка структуры полей Cloudinary
    const cloudinaryUrl = req.file.path || req.file.secure_url || req.file.url;
    console.log('Using URL:', cloudinaryUrl);
    
    res.json({
        url: cloudinaryUrl, // Используем наиболее подходящее поле для URL
        filename: req.file.filename,
        original: req.file // Отправляем весь объект для отладки на фронтенде
    });
})

// Эндпоинт для удаления изображения
app.delete('/uploads/:filename', checkAuth, async (req, res) => {
    try {
      let filename = req.params.filename;
      console.log('Trying to delete file from Cloudinary. Original filename:', filename); // Лог для отладки
      
      // Если filename содержит путь к папке postlearn, извлекаем только имя файла
      if (filename.includes('postlearn/')) {
        filename = filename.split('postlearn/').pop();
        console.log('Extracted filename from path:', filename);
      }
      
      // Если в запросе указан путь с .png, .jpg и т.д., удаляем расширение
      if (filename.includes('.')) {
        filename = filename.split('.')[0];
        console.log('Removed extension, using filename:', filename);
      }
      
      // Добавляем префикс папки, если он отсутствует
      const publicId = filename.includes('postlearn/') ? filename : `postlearn/${filename}`;
      console.log('Using public ID for Cloudinary delete:', publicId);
      
      // Удаляем файл из Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Cloudinary delete result:', result); // Лог для отладки
      
      if (result.result === 'ok') {
        res.json({ message: 'Файл успешно удален' });
      } else {
        res.status(404).json({ message: 'Файл не найден или не может быть удален' });
      }
    } catch (err) {
      console.error('Error deleting file from Cloudinary:', err);
      res.status(500).json({ message: 'Ошибка при удалении файла' });
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
app.get('/posts/tag/:tag', getPostsByTag); //получаем посты по тегу

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
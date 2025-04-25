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
import fs from 'fs'; // импортируем для работы с файлами
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
      folder: 'postlearn',
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

app.use(cors({
    origin: process.env.FRONTEND_URL || `https://friends-posts.netlify.app`,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// const upload = multer({ 
//     storage: multer.diskStorage({ //конфигурация для multer
//         destination: (_, __, cb) => { //куда будем сохранять файлы
//             cb(null, 'uploads'); //путь к папке
//         },
//         filename: (_, file, cb) => { //как будем называть файл      
//             cb(null, file.originalname); //название файла
//         }
//     })
// });

app.use(express.json()); //Сделали так, чтобы можно было принимать json в запросах
app.use('/uploads', express.static('uploads'))  //если придёт запрос на /uploads, то отдаём файлы из папки uploads

app.post('/uploads', checkAuth, upload.single('image'), (req, res) => { //загружаем изображение и сохраняем его в папку uploads
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
    }
    res.json({
        url: `/uploads/${req.file.originalname}` //возвращаем url изображения
    });
}) 
// Эндпоинт для удаления изображения
app.delete('/uploads/:filename', checkAuth, (req, res) => {
    try {
      const filePath = path.join(__dirname, 'uploads', req.params.filename);
      
      // Проверяем существование файла
      if (fs.existsSync(filePath)) {
        // Удаляем файл
        fs.unlinkSync(filePath);
        res.json({ message: 'Файл успешно удален' });
      } else {
        res.status(404).json({ message: 'Файл не найден' });
      }
    } catch (err) {
      console.error('Error deleting file:', err);
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
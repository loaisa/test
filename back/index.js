import 'dotenv/config';
import express from 'express'; // импортируем для создания сервера
import mongoose from 'mongoose'; // импортируем для подключения к MongoDB
import cors from 'cors'; // импортируем для обработки CORS
import { registerValidation, loginValidation, postCreateValidationValidation } from './validations/validations.js' // импортируем для валидации
import { register, login, getMe, getOneUser } from './controllers/UserController.js' // импортируем для регистрации и авторизации   
import { createPost, getAll, getOne, remove, update, getUserPosts } from './controllers/PostController.js' // импортируем для создания, получения, удаления и обновления постов
import checkAuth from './utils/checkAuth.js' // импортируем для проверки авторизации
import multer from 'multer' // импортируем для загрузки изображений
import { validationErrors } from './utils/VallidationErros.js' // импортируем для проверки валидации
const app = express(); //создали сервер

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log(err);
}); //Подключились к MongoDB    

app.listen(3001, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Server is running on port 3001');
    }
}); //Запустили сервер на порту 

app.use(cors({
    origin: 'http://localhost:3000', // URL вашего фронтенда
    credentials: true
  }));
const upload = multer({ 
    storage: multer.diskStorage({ //конфигурация для multer
        destination: (_, __, cb) => { //куда будем сохранять файлы
            cb(null, 'uploads') }, //путь к папке
            filename: (_, file, cb) => { //как будем называть файл      
                cb(null, file.originalname) //название файла
            }
        })
    })

app.use(express.json()); //Сделали так, чтобы можно было принимать json в запросах



app.post('/uploads', checkAuth, upload.single('image'), (req, res) => { //загружаем изображение и сохраняем его в папку uploads
    res.json({
        url: `/uploads/${req.file.originalname}` //возвращаем url изображения
    })
}) 

app.use('/uploads', express.static('uploads')) // если придёт запрос на /uploads, то отдаём файлы из папки uploads

app.post('/auth/login', loginValidation, validationErrors, login); //проверяем валидацию и логиним пользователя и отправляем ошибки
app.post('/auth/register', registerValidation, validationErrors, register) //проверяем валидацию и регистрируем пользователя и отправляем ошибки
app.get('/auth/me', checkAuth, getMe) //проверяем авторизацию и получаем информацию о пользователе
app.get('/users/:id', getOneUser) //получаем один пользователя по id

app.get('/posts', getAll) //получаем последние теги
app.get('/posts/user/:id', checkAuth, getUserPosts) //получаем посты пользователя по id
app.get('/posts/:id', getOne) //получаем один пост по id
app.post('/posts', checkAuth, postCreateValidationValidation, validationErrors, createPost) //проверяем авторизацию и валидацию поста, статью нельзя создать без авторизации и отправляем ошибки
app.delete('/posts/:id', checkAuth, remove) //удаляем пост по id
app.patch('/posts/:id', checkAuth, postCreateValidationValidation, validationErrors, update) //обновляем пост по id
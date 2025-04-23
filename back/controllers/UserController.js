import jwt from 'jsonwebtoken'; // импортируем для создания токена
import UserModel from '../models/User.js'
import bcrypt from 'bcrypt'
import 'dotenv/config'

export const register = async (req, res) => {
    try {
        //Перед тем как создать пользователя, нужно зашифровать пароль
        const password = req.body.password
        const salt = await bcrypt.genSalt(10) //Генерируем соль
        const hash = await bcrypt.hash(password, salt) //Зашифровываем пароль

        const email = req.body.email

        const existingUser = await UserModel.findOne({ email: email }) //Ищем пользователя по email     
        if (existingUser) {
            return res.status(400).json({
                message: 'Данный email уже зарегистрирован' //Если пользователь с таким email уже существует, то возвращаем ошибку
            })
        }

        const doc = new UserModel({
            email: req.body.email,
            fullName: req.body.fullName,
            passwordHash: hash,
            avatarUrl: req.body.avatarUrl,
        }) //Создаем пользователя


        const user = await doc.save() //Сохраняем пользователя в базу данных

        const token = jwt.sign({
            _id: user._id,
        }, process.env.JWT_SECRET, { expiresIn: '30d' }) //Создаем токен для пользователя и записываем в него id пользователя и секретный ключ и срок действия токена

        const { passwordHash, ...userData } = user._doc //Избавляемся от passwordHash  

        res.json({
            ...userData,
            token
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось зарегистрироваться'
        })
    }
} //Контроллер для регистрации пользователя 


export const login = async (req, res) => {

    try {
        const user = await UserModel.findOne({ email: req.body.email }) //Ищем пользователя по email

        if (!user) {
            return res.status(401).json({
                message: 'Не верный логин или пароль'
            })
        } //Если пользователь не найден, то возвращаем ошибку

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash) //Сравниваем пароль с зашифрованным паролем в базе данных

        if (!isValidPass) {
            return res.status(401).json({
                message: 'Не верный логин или пароль'
            })
        } //Если пароль не верный, то возвращаем ошибку


        const token = jwt.sign({
            _id: user._id,
        }, process.env.JWT_SECRET, { expiresIn: '30d' }) //Создаем токен для пользователя и записываем в него id пользователя и секретный ключ и срок действия токена

        const { passwordHash, ...userData } = user._doc //Избавляемся от passwordHash  

        res.json({
            ...userData,
            token
        }) //Отправляем токен в ответе и данные пользователя
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоваться'
        })
    }
} //Контроллер для авторизации пользователя 

export const getMe = async (req, res) => { //Проверяем токен на валидность и отправляем данные пользователя
    try {
        const user = await UserModel.findById(req.userId) //Ищем пользователя по id
        if (!user) {
            return res.status(401).json({
                message: 'Не верный логин или пароль' //Если пользователь не найден, то возвращаем ошибку
            })
        }

        const { passwordHash, ...userData } = user._doc //Избавляемся от passwordHash  

        res.json(userData) //Отправляем данные пользователя
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось авторизоваться' //Если что-то пошло не так, то возвращаем ошибку
        })
    }
} //Контроллер для получения данных пользователя

export const getOneUser = async (req, res) => { //Получаем одного пользователя по id
    try {
        const userId = req.params.id
        const user = await UserModel.findById(userId)
        if (!user) {
            return res.status(404).json({
                message: 'Пользователь не найден'
            })
        }
        const { passwordHash, ...userData } = user._doc;
        res.json(userData)
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить пользователя'
        })
    }
}   

export const updateImageUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Проверяем, загружен ли файл
        if (!req.file) {
            return res.status(400).json({ message: 'Файл не найден' });
        }

        const avatarUrl = `/uploads/${req.file.filename}`;
        
        const user = await UserModel.findOneAndUpdate(
            { _id: userId },
            { 
                $set: { avatarUrl: avatarUrl }
            },
            { new: true }
        );
          // Исключаем passwordHash из ответа
        const { passwordHash, ...userData } = user._doc;
        res.json({
            user: userData,
            url: avatarUrl
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить изображение пользователя'
        });
    }
}
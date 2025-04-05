import {body} from 'express-validator'

export const loginValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({min:5}),
] //валидация для авторизации


export const registerValidation = [
    body('email', 'Неверный формат почты').isEmail(),
    body('password', 'Пароль должен быть минимум 5 символов').isLength({min:5}),
    body('fullName', 'Имя должно быть минимум 2 символа').isLength({min:2}).isString()
        .matches(/^[а-яА-ЯёЁa-zA-Z\s]+$/, 'i').withMessage('Имя должно содержать только буквы'),
    body('avatarUrl', 'Неверная ссылка на аватарку').optional().isURL(),
] //валидация для регистрации

export const postCreateValidationValidation = [
    body('title', 'Введите заголовок статьи').isLength({min:3}).isString(),
    body('text', 'Введите текст статьи').isLength({min:10}).isString(),
    body('tags', 'Неверный формат тэгов').optional().isArray().notEmpty(),
    body('imageUrl', 'Неверная ссылка на изображение').optional().isString().notEmpty(),
] //валидация для поста


import { validationResult } from 'express-validator' //импортируем для проверки валидации

export const validationErrors = (req, res, next) => { //проверяем валидацию и отправляем ошибки

    const errors = validationResult(req) //проверяем валидацию

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg
        }) //если есть ошибки, то отправляем ошибки
    }
    next()
}

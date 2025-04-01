
import jwt from 'jsonwebtoken'

export default (req, res, next) => { // Проверяем токен на валидность и отправляем данные пользователя

    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '') //Извлекаем токен из заголовка


    if (token) { //Если токен найден
        try {
            const decoded = jwt.verify(token, 'secret') //Проверяем токен на валидность и декодируем его
            req.userId = decoded._id //Записываем id пользователя в request
            next() // всё ок, выполняем следующую функцию
        } catch (err) {
            return res.status(403).json({
                message: 'Нет доступа'
            })
        }
    }
    else { //Если токен не найден
        return res.status(403).json({
            message: 'Нет доступа' //Если токен не найден, то возвращаем ошибку
        })
    }
} 


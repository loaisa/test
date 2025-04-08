import PostModel from '../models/Post.js'
import mongoose from 'mongoose'

export const createPost = async (req, res) => {
    try {
        const doc = new PostModel({
            title: req.body.title,
            text: req.body.text,
            imageUrl: req.body.imageUrl,
            tags: req.body.tags,
            user: req.userId, //id пользователя, который создает пост, берется из токена при авторизации
        })

        const post = await doc.save()
        res.json(post)


    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось создать пост'
        })
    }
}

export const getAll = async (req, res) => {
    try {
        const posts = await PostModel.find().populate({ path: 'user', select: ['_id', 'fullName', 'avatarUrl'] }).exec()
        //populate - заполняет поля пользователя в посте и выбираем нужные поля
        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить последние теги'
        })
    }
}

export const getOne = async (req, res) => {
    try {
        const postId = req.params.id //id поста из url
        const post = await PostModel.findByIdAndUpdate( //findByIdAndUpdate - находит пост по id и обновляет его
            postId,
            { $inc: { viewsCount: 1 } }, //увеличиваем количество просмотров поста с помощью $inc
            { returnDocument: 'after' } //возвращает обновленный документ
        ).populate({ path: 'user', select: ['_id', 'fullName', 'avatarUrl'] }); // Добавляем populate для пользователя, то есть заполняем поле user в посте

        if (!post) { //если пост не найден, возвращаем ошибку
            return res.status(404).json({
                message: 'Пост не найден'
            })
        }

        res.json(post) //возвращаем пост

    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить пост' //если возникает ошибка, возвращаем ошибку
        })
    }
}

export const remove = async (req, res) => {
    try {
        const postId = req.params.id //id поста из url
        const post = await PostModel.findOneAndDelete({ _id: postId }) //удаляем пост по id

        if (!post) { //если пост не найден, возвращаем ошибку
            return res.status(404).json({
                message: 'Пост не найден'
            })
        }

        res.json({
            message: 'Пост удален' //возвращаем сообщение об удалении поста
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось удалить пост' //если возникает ошибка, возвращаем ошибку
        })
    }
}

export const update = async (req, res) => { //обновляем пост по id
    try {
        const postId = req.params.id //id поста из url
        const post = await PostModel.findOneAndUpdate( //findOneAndUpdate - находит пост по id и обновляет его
            { _id: postId }, //id поста 
            {
                title: req.body.title, //обновляем title
                text: req.body.text, //обновляем text
                imageUrl: req.body.imageUrl, //обновляем imageUrl
                tags: req.body.tags, //обновляем tags   
            },
            { new: true } //возвращает обновленный пост
        )

        if (!post) { //если пост не найден, возвращаем ошибку
            return res.status(404).json({
                message: 'Пост не найден'
            })
        }

        res.json({
            message: 'Пост обновлен' //возвращаем сообщение об обновлении поста
        })
    }

    catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось обновить пост' //если возникает ошибка, возвращаем ошибку
        })
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const userId = req.params.id //id пользователя из url
        console.log(userId)
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Неверный ID пользователя'
            })
        }

        const posts = await PostModel.find({ user: userId })
            .populate({ path: 'user', select: ['_id', 'fullName', 'avatarUrl'] })
            .exec()

        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(500).json({
            message: 'Не удалось получить посты пользователя'
        })
    }
}   

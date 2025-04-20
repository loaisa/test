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

export const getTags = async (req, res) => {
    try {
        const posts = await PostModel.find({}, 'tags').exec(); //find - находит все посты, tags - выбираем поле tags
        
        // Считаем популярность тегов
        const tagCounts = {};
        posts.forEach(post => {
            post.tags.forEach(tag => { //forEach - проходим по всем тегам в посте
                tagCounts[tag] = (tagCounts[tag] || 0) + 1; //если тег уже есть в массиве, то увеличиваем его количество на 1
            });
        });
        
        // Преобразуем в массив объектов и сортируем по популярности
        const sortedTags = Object.keys(tagCounts) //Получаем массив ключей (названий тегов):
            .map(tag => ({ //Преобразуем массив строк в массив объектов: например ['react', 'js']
                name: tag, 
                count: tagCounts[tag] // в массиве будет [{ name: 'react', count: 5 }, { name: 'js', count: 12 }, ...] 
            }))
            .sort((a, b) => b.count - a.count); // сортировку по кол-ву тегов в порядке убывания
        
        res.json(sortedTags);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить теги'
        })
    }
}   

export const toggleLike = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId; // ID пользователя из токена

        // Находим пост
        const post = await PostModel.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                message: 'Пост не найден'
            });
        }

        // Проверяем, есть ли лайк от этого пользователя
        const hasLiked = post.likedBy && post.likedBy.includes(userId);

        // Обновляем пост
        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            {
                $inc: { likesCount: hasLiked ? -1 : 1 },
                [hasLiked ? '$pull' : '$addToSet']: { likedBy: userId } //$pull - удаляет элемент из массива если hasLiked true,
                //  $addToSet - добавляет элемент в массив (если его там еще нет)
            },
            { new: true }
        );

        res.json(updatedPost);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось обновить лайк'
        });
    }
}

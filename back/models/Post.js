import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    tags: {
        type: Array,
        default: [],
        required: true,
    },
    viewsCount: {
        type: Number,
        default: 0,
    },
    likesCount: {
        type: Number,
        default: 0,
    },
    likedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'User'
    },
    comments: [{
        text: {
          type: String,
          required: true
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }],
    user: {
        type: mongoose.Schema.Types.ObjectId, //ссылка на пользователя в базе данных
        ref: 'User', //ссылка на модель пользователя
        required: true,
    },
    imageUrl: String,
}, {
    timestamps: true,
})

export default mongoose.model('Post', postSchema) //экспортируем модель поста

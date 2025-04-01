import mongoose from "mongoose"



const userSchema = new mongoose.Schema({ //создаем схему пользователя
    fullName: {
        type: String,
        requred: true,
    },
    email: {
        type: String,
        requred: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        requred: true,
    },
    avatarUrl: String,
    },
     {
    timestamps: true,
})

export default mongoose.model('User', userSchema)
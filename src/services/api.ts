import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; //ссылка на сервер

const api = axios.create({
    baseURL: API_URL,
}); 

export const authApi = {
    register: async (email: string, fullName: string, password: string) => { //регистрация пользователя
        const response = await api.post('/auth/register', { email, fullName, password }); //отправляем запрос на регистрацию и получаем ответ
        console.log(response)
        return response.data;
    },
    login: async (email: string, password: string) => { //авторизация пользователя
        const response = await api.post('/auth/login', { email, password }); //отправляем запрос на авторизацию и получаем ответ
        return response.data;
    },
    getMe: async () => { //получение данных пользователя
        const response = await api.get('/auth/me'); //отправляем запрос на получение данных пользователя и получаем ответ
        return response.data;
    },
    getOneUser: async (id: string) => { //получение данных пользователя по id
        const response = await api.get(`/users/${id}`); //отправляем запрос на получение данных пользователя по id и получаем ответ
        return response.data;
    }   
} 
export const postApi = {
    createPost: async (title: string, content: string) => { //создание поста
        const response = await api.post('/posts', { title, content }); //отправляем запрос на создание поста и получаем ответ
        return response.data;
    },
    getPosts: async () => { //получение всех постов
        const response = await api.get('/posts'); //отправляем запрос на получение всех постов и получаем ответ
        return response.data;
    },
    getOnePost: async (id: string) => { //получение поста по id
        const response = await api.get(`/posts/${id}`); //отправляем запрос на получение поста по id и получаем ответ
        return response.data;
    },
    updatePost: async (id: string, title: string, content: string) => { //обновление поста
        const response = await api.put(`/posts/${id}`, { title, content }); //отправляем запрос на обновление поста и получаем ответ
        return response.data;
    }
}
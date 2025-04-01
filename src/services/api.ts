import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL; //ссылка на сервер

const api = axios.create({
    baseURL: API_URL,
}); 

export const authApi = {
    register: async (email: string, fullName: string, password: string) => { //регистрация пользователя
        const response = await api.post('/auth/register', { email, fullName, password }); //отправляем запрос на регистрацию и получаем ответ
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
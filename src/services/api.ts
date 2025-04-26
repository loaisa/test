import axios from 'axios';
import { CreatePostData } from '../types/types';

const API_URL = process.env.REACT_APP_API_URL || 'https://friendsposts.up.railway.app';

const api = axios.create({
    baseURL: API_URL,
});

// Добавляем перехватчик для добавления токена
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Добавляем перехватчик для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Ошибка с ответом от сервера
            return Promise.reject(error.response.data);
        } else if (error.request) {
            // Ошибка без ответа от сервера
            return Promise.reject({ message: 'Нет ответа от сервера' });
        } else {
            // Ошибка при настройке запроса
            return Promise.reject({ message: 'Ошибка при отправке запроса' });
        }
    }
);

export const authApi = {
    register: async (email: string, fullName: string, password: string) => {
        try {
            const response = await api.post('/auth/register', { email, fullName, password }); //делаем запрос на регистрацию и данные, в случае ошибки 
            // выбрасываем ошибку, если всё ок, то возвращаем ответ.
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    login: async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getMe: async () => {
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getOneUser: async (id: string) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
};

export const postApi = {
    createPost: async (data: CreatePostData) => {
        try {
            const response = await api.post('/posts', data);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getPosts: async () => {
        try {
            const response = await api.get('/posts');
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getOnePost: async (id: string) => {
        try {
            const response = await api.get(`/posts/${id}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    updatePost: async (id:string,data: CreatePostData) => {
        try {
            const response = await api.patch(`/posts/${id}`, data);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getUserPosts: async (id: string) => {
        try {
            const response = await api.get(`/posts/user/${id}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getTags: async () => {
        try {
            const response = await api.get('/posts/tags');
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    remove: async (id: string) => {
        try {
            const response = await api.delete(`/posts/${id}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    toggleLike: async (postId: string) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    addComment: async (postId: string, text: string) => {
        try {
            const response = await api.post(`/posts/${postId}/comment`, { text });
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    getPostsByTag: async (tag: string) => {
        try {
            const response = await api.get(`/posts/tag/${tag}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    uploadImage: async (formData: FormData) => {
        try {
            const response = await api.post(`/uploads`, formData)
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },
    deleteImage: async (filename: string) => {
        try {
            const response = await api.delete(`/uploads/${filename}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
};

export const userApi = {
    updateImageUser: async (id: string, formData: FormData )=>{
        try {
            const response = await api.patch(`/users/${id}/update-image`, formData)
            return response.data
        }catch(error: any){
            throw error
        }
    },

}
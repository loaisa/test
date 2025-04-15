import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
            const response = await api.post('/auth/register', { email, fullName, password });
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
    createPost: async (title: string, content: string) => {
        try {
            const response = await api.post('/posts', { title, content });
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
    updatePost: async (id: string, title: string, content: string) => {
        try {
            const response = await api.put(`/posts/${id}`, { title, content });
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
    getPostsByTag: async (tag: string) => {
        try {
            const response = await api.get(`/posts/tag/${tag}`);
            return response.data;
        } catch (error: any) {
            throw error;
        }
    }
};
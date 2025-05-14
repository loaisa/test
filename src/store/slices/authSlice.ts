import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { authApi, userApi } from '../../services/api';

// Добавим новую функцию для получения базовых данных о пользователе из localStorage
export const getUserFromLocalStorage = () => {
    try {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
        return null;
    }
};

export const fetchLogin = createAsyncThunk('auth/login', async (data: { email: string, password: string }) => { //логин пользователя
    const response = await authApi.login(data.email, data.password); //отправляем данные на сервер
    localStorage.setItem('token', response.token) //сохраняем токен в localStorage
    return response; //возвращаем ответ от сервера
})

export const fetchRegister = createAsyncThunk('auth/register', async (data: { email: string, fullName: string, password: string }) => { //регистрация пользователя
    const response = await authApi.register(data.email, data.fullName, data.password); //отправляем данные на сервер
    localStorage.setItem('token', response.token) //сохраняем токен в localStorage
    return response; //возвращаем ответ от сервера
})

export const checkAuth = createAsyncThunk('auth/check', async (_, { dispatch }) => { //проверка авторизации

    try {
        const token = localStorage.getItem('token'); //получаем токен из localStorage
        if (!token) {
            throw new Error('No token found'); //если токена нет, то выбрасываем ошибку
        }

        // Используем кэшированные данные 
        const cachedUser = localStorage.getItem('userData');
        if (!cachedUser) {
            throw new Error('No user data');
        }
        // Тихая асинхронная валидация токена
        // Это не блокирует UI и происходит в фоновом режиме
        authApi.getMe().then(
            (userData) => {
                // Обновляем данные пользователя, если они изменились
                localStorage.setItem('userData', JSON.stringify(userData));
                dispatch(updateUserData(userData));
            },
            (error) => {
                // Если токен стал невалидным, выполняем выход
                console.error('Token validation failed:', error);
                dispatch(logout());
            }
        );
        // Сразу возвращаем кэшированные данные для быстрого рендеринга
        return { user: JSON.parse(cachedUser), token };
    } catch (error) {
        // Обработка ошибок
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        throw new Error('Authentication failed');
    }
});
const updateUserData = createAction<any>('auth/updateUserData');

export const updateUserAvatar = createAsyncThunk(
    'auth/updateUserAvatar',
    async ({ userId, formData }: { userId: string, formData: FormData }) => {
        const response = await userApi.updateImageUser(userId, formData);

        return response;
    }
);

type AuthState = {
    user: any;
    token: string | null;
    loading: boolean;
    error: string | null;
    isAuth: boolean;
}
const initialState: AuthState = {
    user: getUserFromLocalStorage(), // Загружаем пользователя из localStorage
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
    // Устанавливаем isAuth: true, если есть и токен, и данные пользователя
    isAuth: !!localStorage.getItem('token') && !!JSON.parse(localStorage.getItem('userData') || 'null')
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => { //выход из системы
            state.user = null; //удаляем пользователя из state
            state.token = null; //удаляем токен из state
            state.isAuth = false; //удаляем isAuth из state
            localStorage.removeItem('token'); //удаляем токен из localStorage
            localStorage.removeItem('isAuth');
            localStorage.removeItem('userData');
            localStorage.removeItem('user');
        },
        // Добавляем обработчик для тихого обновления данных
        updateUserData: (state, action) => {
            state.user = action.payload;
        },
        setAuthState: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuth = action.payload.isAuth;
            state.loading = false;
        },

    },
    extraReducers: (builder) => {
        builder.addCase(fetchLogin.pending, (state) => { //если запрос выполняется
            state.loading = true; //устанавливаем loading в true
        })
            .addCase(fetchLogin.fulfilled, (state, action) => {   //если запрос выполнен успешно
                state.token = action.payload.token; //сохраняем токен в state
                localStorage.setItem('token', action.payload.token)
                localStorage.setItem('isAuth', 'true')
                localStorage.setItem('userData', JSON.stringify(action.payload)); // Сохраняем пользователя
                state.isAuth = true; //устанавливаем isAuth в true
                state.loading = false; //устанавливаем loading в false
                state.user = action.payload; //сохраняем пользователя в state
                console.log(action.payload)
            })
            .addCase(fetchLogin.rejected, (state, action) => { //если запрос выполнен с ошибкой
                state.error = action.error.message || null; //сохраняем ошибку в state
                state.loading = false; //устанавливаем loading в false
            })


            .addCase(fetchRegister.pending, (state) => { //если запрос выполняется
                state.loading = true; //устанавливаем loading в true
            })
            .addCase(fetchRegister.fulfilled, (state, action) => { //если запрос выполнен успешно
                state.token = action.payload.token; //сохраняем токен в state
                localStorage.setItem('token', action.payload.token)
                localStorage.setItem('userData', JSON.stringify(action.payload)); // Сохраняем пользователя
                state.isAuth = true; //устанавливаем isAuth в true
                state.loading = false; //устанавливаем loading в false
                state.user = action.payload; //сохраняем весь payload в sate.user
            })
            .addCase(fetchRegister.rejected, (state, action) => { //если запрос выполнен с ошибкой    
                state.error = action.error.message || null; //сохраняем ошибку в state
                state.loading = false; //устанавливаем loading в false
            })


            .addCase(checkAuth.pending, (state) => { //если запрос выполняется
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => { //если запрос выполнен успешно
                state.user = action.payload.user; //сохраняем пользователя в state
                state.token = action.payload.token; //сохраняем токен в state
                state.isAuth = true; //устанавливаем isAuth в true
                state.loading = false; //устанавливаем loading в false
            })
            .addCase(checkAuth.rejected, (state) => { //если запрос выполнен с ошибкой
                state.user = null;
                state.token = null;
                state.isAuth = false;
                state.loading = false;
                localStorage.removeItem('token');
            })

            .addCase(updateUserAvatar.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUserAvatar.fulfilled, (state, action) => {
                // Обновляем аватар пользователя в state
                state.user = action.payload.user;
                if (state.user) {
                    state.user.avatarUrl = action.payload.url;
                    // Обновляем данные в localStorage
                    localStorage.setItem('userData', JSON.stringify(state.user));
                }
                state.loading = false;
            })
            .addCase(updateUserAvatar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || null;
            });
    }
})

export const { logout, setAuthState } = authSlice.actions;
export default authSlice.reducer;
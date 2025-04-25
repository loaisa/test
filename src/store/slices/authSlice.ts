import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, userApi } from '../../services/api';

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

export const checkAuth = createAsyncThunk('auth/check', async () => { //проверка авторизации
    const token = localStorage.getItem('token'); //получаем токен из localStorage
    if (!token) {
        throw new Error('No token found'); //если токена нет, то выбрасываем ошибку
    }

    const response = await authApi.getMe();
    return { user: response, token };
});

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
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuth: localStorage.getItem('isAuth') === 'true' ? true : false,
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
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchLogin.pending, (state) => { //если запрос выполняется
            state.loading = true; //устанавливаем loading в true
        })
            .addCase(fetchLogin.fulfilled, (state, action) => {   //если запрос выполнен успешно
                state.token = action.payload.token; //сохраняем токен в state
                localStorage.setItem('token', action.payload.token)
                localStorage.setItem('isAuth', 'true')
                state.isAuth = true; //устанавливаем isAuth в true
                state.loading = false; //устанавливаем loading в false
                state.user = action.payload; //сохраняем пользователя в state
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
                }
                state.loading = false;
            })
            .addCase(updateUserAvatar.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || null;
            });
    }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postApi } from "../../services/api";

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => { //получение всех постов
  const response = await postApi.getPosts();
  return response;
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id: string) => { //удаление поста
  const response = await postApi.remove(id);
  return response;
});

type PostState = {
  posts: any[];
  loading: boolean;
  error: string | null;
};

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => { 
    builder.addCase(fetchPosts.pending, (state) => { //если запрос выполняется
      state.loading = true; //устанавливаем loading в true
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => { //если запрос выполнен успешно
      state.posts = action.payload; //сохраняем посты в state
      state.loading = false; //устанавливаем loading в false
    });
    builder.addCase(fetchPosts.rejected, (state, action) => { //если запрос выполнен с ошибкой
      state.error = action.error.message || null; //сохраняем ошибку в state
      state.loading = false; //устанавливаем loading в false
    });

    builder.addCase(deletePost.pending, (state) => { //если запрос выполняется
      state.loading = true; //устанавливаем loading в true
    });
    builder.addCase(deletePost.fulfilled, (state, action) => { //если запрос выполнен успешно
      state.posts = state.posts.filter((post) => post._id !== action.payload); //удаляем пост из state
      state.loading = false; //устанавливаем loading в false
    }); 
  },
});

export default postsSlice.reducer;


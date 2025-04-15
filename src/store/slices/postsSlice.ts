import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postApi } from "../../services/api";

// Интерфейс для структуры поста
export interface Post {
  _id: string;
  title: string;
  text: string;
  tags: string[];
  viewsCount: number;
  user: {
    _id: string;
    fullName: string;
  };
  imageUrl: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[]; // Массив ID пользователей, которые поставили лайк
}

// Интерфейс для состояния хранилища постов
interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {  //получение всех постов
  const response = await postApi.getPosts();
  return response;
});

export const deletePost = createAsyncThunk('posts/deletePost', async (id: string) => { //удаление поста
  const response = await postApi.remove(id);
  return response;
});

// Асинхронный thunk для переключения лайка
export const togglePostLike = createAsyncThunk(
  'posts/togglePostLike',
  async (postId: string) => {
    const response = await postApi.toggleLike(postId);
    console.log('Server response:', response);
    return response;
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(fetchPosts.pending, (state) => { //если запрос выполняется
      state.loading = true; //устанавливаем loading в true
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => { //если запрос выполнен успешно
      state.posts = action.payload; //сохраняем посты в state
      state.loading = false; //устанавливаем loading в false
    })
      .addCase(deletePost.pending, (state) => { //если запрос выполняется
        state.loading = true; //устанавливаем loading в true
      })
      .addCase(deletePost.fulfilled, (state, action) => { //если запрос выполнен успешно
        state.posts = state.posts.filter((post) => post._id !== action.payload); //удаляем пост из state
        state.loading = false; //устанавливаем loading в false
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
          // Обработка успешного переключения лайка
        const updatedPost = action.payload;
        console.log(updatedPost);
        
        // Находим индекс поста в массиве
        const postIndex = state.posts.findIndex(post => post._id === updatedPost._id); //получаем индекс поста
        console.log(postIndex)
        if (postIndex !== -1) {  // Проверяем, что пост был найден
          // Обновляем только необходимые поля поста
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            likesCount: updatedPost.likesCount, // Обновляем количество лайков
            likedBy: updatedPost.likedBy // Обновляем список пользователей, поставивших лайк
          };
          console.log('After update:', state.posts[postIndex]);
        }
      })
      // Обработка ошибки при переключении лайка
      .addCase(togglePostLike.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка';
        state.loading = false;
      });
  },
});

// export const { togglePostLike } = postsSlice.actions;
export default postsSlice.reducer;


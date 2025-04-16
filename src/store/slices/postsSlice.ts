import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postApi } from "../../services/api";
import { CreatePostData, Post } from "../../types/types";




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

export const fetchOnePost = createAsyncThunk('posts/fetchOnePosts', async (id: string) => {  //получение одного поста по id
  const response = await postApi.getOnePost(id);
  return response;
});

export const createPost = createAsyncThunk('post/createPost', async (data: CreatePostData) => {
  const response = await postApi.createPost(data)
  console.log(response)
  return response
})

// Асинхронный thunk для переключения лайка
export const togglePostLike = createAsyncThunk(
  'posts/togglePostLike',
  async (postId: string) => {
    const response = await postApi.toggleLike(postId);
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
    builder.addCase(fetchPosts.rejected, (state, action) => { //если запрос выполнен с ошибкой
      state.error = action.error.message || null; //сохраняем ошибку в state
      state.loading = false; //устанавливаем loading в false
    })
      .addCase(fetchOnePost.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchOnePost.fulfilled, (state, action) => { //получаем пост если выполнено успешно
        state.posts = action.payload
        state.loading = false
      })
      .addCase(fetchOnePost.rejected, (state, action) => {
        state.error = action.error.message || null
        state.loading = false
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

        // Находим индекс поста в массиве
        const postIndex = state.posts.findIndex(post => post._id === updatedPost._id); //получаем индекс поста
        if (postIndex !== -1) {  // Проверяем, что пост был найден
          // Обновляем только необходимые поля поста
          state.posts[postIndex] = {
            ...state.posts[postIndex],
            likesCount: updatedPost.likesCount, // Обновляем количество лайков
            likedBy: updatedPost.likedBy // Обновляем список пользователей, поставивших лайк
          };
        }
      })
      // Обработка ошибки при переключении лайка
      .addCase(togglePostLike.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка';
        state.loading = false;
      })
      // Создание пооста
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка при создании поста';
        state.loading = false;
      })

  },
});

// export const { togglePostLike } = postsSlice.actions;
export default postsSlice.reducer;


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
  posts: (() => {
    try { //проверяем, является ли posts массивом
      const parsedPosts = JSON.parse(localStorage.getItem('posts') || '[]'); //парсим posts из localStorage
      return Array.isArray(parsedPosts) ? parsedPosts : []; //если является, то возвращаем его, если нет, то возвращаем пустой массив
    } catch (e) {
      return []; //если возникает ошибка, то возвращаем пустой массив
    }
  })(),
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

export const fetchOnePost = createAsyncThunk('posts/fetchOnePost', async (id: string) => {  //получение одного поста по id
  try {
    const response = await postApi.getOnePost(id);
    return response;
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error; // Пробрасываем ошибку, чтобы она была обработана в редюсере
  }
});

export const createPost = createAsyncThunk('post/createPost', async (data: CreatePostData) => {
  const response = await postApi.createPost(data)
  return response
})

export const updatePost = createAsyncThunk('post/updatePost', async ({ id, data }: { id: string, data: CreatePostData }) => {

  try {
    const response = await postApi.updatePost(id, data)
    return response
  } catch (error: any) {
    console.error('Error updating post:', error);
    throw error;
  }
})

// Асинхронный thunk для переключения лайка
export const togglePostLike = createAsyncThunk('posts/togglePostLike', async (postId: string) => {
  const response = await postApi.toggleLike(postId);
  return response;
}
);

export const addComment = createAsyncThunk('posts/addComment', async ({ id, text }: { id: string, text: string }) => {
  const response = await postApi.addComment(id, text);
  console.log(response)
  return response;
}
);


const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Получение всех постов
      .addCase(fetchPosts.pending, (state) => { //если запрос выполняется
        state.loading = true; //устанавливаем loading в true
      })
      .addCase(fetchPosts.fulfilled, (state, action) => { //если запрос выполнен успешно
        state.posts = action.payload; //сохраняем посты в state
        state.loading = false; //устанавливаем loading в false
        localStorage.setItem('posts', JSON.stringify(state.posts)); //сохраняем посты в localStorage
      })
      .addCase(fetchPosts.rejected, (state, action) => { //если запрос выполнен с ошибкой
        state.error = action.error.message || null; //сохраняем ошибку в state
        state.loading = false; //устанавливаем loading в false
      })
      // Получение одного поста
      .addCase(fetchOnePost.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchOnePost.fulfilled, (state, action) => { //получаем пост если выполнено успешно
        const postIndex = state.posts.findIndex(post => post._id === action.payload._id);
        if (postIndex !== -1) {
          state.posts[postIndex] = action.payload; // Обновляем существующий пост
        } else {
          state.posts.push(action.payload); // Добавляем новый пост
        }
        state.loading = false;
      })
      .addCase(fetchOnePost.rejected, (state, action) => {
        state.error = action.error.message || null
        state.loading = false
      })
      // Удаление поста
      .addCase(deletePost.pending, (state) => { //если запрос выполняется
        state.loading = true; //устанавливаем loading в true
      })
      .addCase(deletePost.fulfilled, (state, action) => { //если запрос выполнен успешно
        state.posts = state.posts.filter((post) => post._id !== action.payload); //удаляем пост из state
        state.loading = false; //устанавливаем loading в false
      })
      // Переключение лайка
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
      .addCase(togglePostLike.rejected, (state, action) => { //если запрос выполнен с ошибкой
        state.error = action.error.message || 'Ошибка'; //сохраняем ошибку в state
        state.loading = false; //устанавливаем loading в false
      })
      // Создание пооста
      .addCase(createPost.pending, (state) => { //если запрос выполняется
        state.loading = true; //устанавливаем loading в true
        state.error = null; //устанавливаем error в null
      })
      .addCase(createPost.fulfilled, (state, action) => { //если запрос выполнен успешно
        state.posts.unshift(action.payload); //добавляем пост в начало массива
        state.loading = false; //устанавливаем loading в false
        state.error = null; //устанавливаем error в null
      })
      .addCase(createPost.rejected, (state, action) => { //если запрос выполнен с ошибкой
        state.error = action.error.message || 'Ошибка при создании поста'; //сохраняем ошибку в state
        state.loading = false; //устанавливаем loading в false
      })
      // Обновление поста
      .addCase(updatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(post => post._id === action.payload._id);//находим индекс поста
        if (postIndex !== -1) {
          state.posts[postIndex] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка при обновлении поста';
        state.loading = false;
      })
      // Добавление комментария
      .addCase(addComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(post => post._id === action.payload._id);//находим индекс поста
        if (postIndex !== -1) {
          state.posts[postIndex] = action.payload;
        }
        state.loading = false;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка при обновлении поста';
        state.loading = false;
      })

  },
});

// export const { togglePostLike } = postsSlice.actions;
export default postsSlice.reducer;


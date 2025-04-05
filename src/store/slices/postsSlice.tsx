import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postApi } from "../../services/api";

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => { //получение всех постов
  const response = await postApi.getPosts();
  return response.data;
});

const initialState = {
  posts: [],
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
});

export default postsSlice.reducer;


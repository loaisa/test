import { configureStore } from "@reduxjs/toolkit";

import postsReducer from "./slices/postsSlice";
import authReducer from "./slices/authSlice";
const store = configureStore({
  reducer: {
    posts: postsReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>; //типизация RootState
export type AppDispatch = typeof store.dispatch;

export default store;


import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import uiReducer from "../features/ui/uiSlice";
import postReducer from '../features/posts/postSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    posts: postReducer,
  },
});

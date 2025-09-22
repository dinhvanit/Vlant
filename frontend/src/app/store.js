import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import uiReducer from "../features/ui/uiSlice";
import postReducer from "../features/posts/postSlice";
import userReducer from "../features/users/userSlice";
import notificationReducer from "../features/notification/notificationSlice";
import chatReducer from "../features/chat/chatSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    posts: postReducer,
    user: userReducer,
    notifications: notificationReducer,
    chat: chatReducer,
  },
});

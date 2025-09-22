import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  notifications: [],
  status: "idle",
  error: null,
  unreadCount: 0,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/notifications");
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // Reducer để thêm notif mới nhận từ socket
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount++;
    },
    // Reducer để reset số đếm khi đã đọc
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { addNotification, resetUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;

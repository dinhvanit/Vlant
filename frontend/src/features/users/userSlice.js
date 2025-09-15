import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  profile: null, // Lưu thông tin profile đang xem
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- Async Thunks ---

// Thunk để lấy thông tin profile của một user
export const fetchUserProfile = createAsyncThunk(
  "user/fetchProfile",
  async (username, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${username}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "User not found.");
    }
  }
);

// Thunk để gửi lời mời kết bạn
export const sendFriendRequest = createAsyncThunk(
  "user/sendFriendRequest",
  async (userId, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/users/request/${userId}`);
      // Sau khi gửi request thành công, ta fetch lại profile để cập nhật friendStatus
      // action.meta.arg chính là userId mà chúng ta đã truyền vào
      const username = action.meta.arg.username; // Cần truyền username để fetch lại
      dispatch(fetchUserProfile(username));
      return userId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not send request."
      );
    }
  }
);

// THUNK MỚI: XỬ LÝ LỜI MỜI (ACCEPT/DECLINE)
export const handleFriendRequest = createAsyncThunk(
  'user/handleFriendRequest',
  async ({ senderId, action }, { rejectWithValue }) => {
    try {
      // action ở đây là 'accept' hoặc 'decline'
      await api.put(`/users/request/${senderId}`, { action });
      return { senderId, action }; // Trả về để reducer xử lý UI
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// THUNK MỚI: HỦY KẾT BẠN
export const unfriend = createAsyncThunk(
  'user/unfriend',
  async (friendId, { rejectWithValue }) => {
    try {
      await api.delete(`/users/friends/${friendId}`);
      return friendId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// --- Slice Definition ---

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Reducer để reset state khi rời khỏi trang profile
    clearProfile: (state) => {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchUserProfile
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload; // Lưu dữ liệu profile vào state
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Xử lý sendFriendRequest
      .addCase(sendFriendRequest.fulfilled, (state) => {
        // Cập nhật ngay lập tức trạng thái trên UI mà không cần chờ fetchUserProfile
        if (state.profile) {
          state.profile.friendStatus = "request_sent";
        }
      })

      .addCase(handleFriendRequest.fulfilled, (state, action) => {
        if (state.profile) {
          // Cập nhật friendStatus trên UI ngay lập tức
          state.profile.friendStatus = action.payload.action === 'accept' ? 'friends' : 'not_friends';
        }
      })
      .addCase(unfriend.fulfilled, (state) => {
        if (state.profile) {
          state.profile.friendStatus = 'not_friends';
        }
      });
  },
});

export const { clearProfile } = userSlice.actions;
export default userSlice.reducer;

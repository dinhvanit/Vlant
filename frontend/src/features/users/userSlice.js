import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
  profile: null, // Lưu thông tin profile đang xem
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  requests: [],
  requestsStatus: 'idle',
  friends: [],
  friendsStatus: 'idle',
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
  async ({ userId, username }, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/users/request/${userId}`);
      return { userId };
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

// THUNK để tìm các lời mời kết bạn
export const fetchFriendRequests = createAsyncThunk(
  'user/fetchFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users/requests/received');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchFriends = createAsyncThunk(
  'user/fetchFriends',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}/friends`);
      return data;
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
      state.friends = [];
      state.friendsStatus = 'idle';
    },

    removeRequest: (state, action) => {
      state.requests = state.requests.filter(req => req._id !== action.payload);
    }
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
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        // Cập nhật ngay lập tức friendStatus nếu profile đang xem khớp với người vừa gửi request
        if (state.profile && state.profile._id === action.payload.userId) {
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
      })

      .addCase(fetchFriendRequests.pending, (state) => {
        state.requestsStatus = 'loading';
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.requestsStatus = 'succeeded';
        state.requests = action.payload;
      })
      .addCase(fetchFriendRequests.rejected, (state) => {
        state.requestsStatus = 'failed';
      })

      .addCase(fetchFriends.pending, (state) => {
        state.friendsStatus = 'loading';
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.friendsStatus = 'succeeded';
        state.friends = action.payload;
      })
      .addCase(fetchFriends.rejected, (state) => {
        state.friendsStatus = 'failed';
      });
  },
});

export const { clearProfile, removeRequest } = userSlice.actions;
export default userSlice.reducer;

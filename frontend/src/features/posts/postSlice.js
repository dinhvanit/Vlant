import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Trạng thái ban đầu
const initialState = {
  posts: [], // Mảng chứa tất cả bài viết
  status: "idle",
  error: null, // Lưu lỗi nếu có
  createStatus: "idle",
};

// --- Async Thunks ---

// Thunk để lấy (fetch) tất cả bài viết từ server
export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/posts");
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response.data.message || "Could not fetch posts."
      );
    }
  }
);

export const createPost = createAsyncThunk(
  "posts/createPost",
  async (postData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/posts", postData);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response.data.message || "Could not create post."
      );
    }
  }
);

// --- Slice Definition ---

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {}, // Không cần reducer đồng bộ lúc này
  extraReducers: (builder) => {
    builder
      // Xử lý các trạng thái của fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading"; // Cập nhật status
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded"; // Cập nhật status
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed"; // Cập nhật status
        state.error = action.payload;
      })

      // --- Xử lý trạng thái cho createPost ---
      .addCase(createPost.pending, (state) => {
        state.createStatus = "loading";
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = "failed";
        // Lỗi tạo bài viết không nên ảnh hưởng đến error của cả feed
        console.error("Create post failed:", action.payload);
      });
  },
});

export default postSlice.reducer;

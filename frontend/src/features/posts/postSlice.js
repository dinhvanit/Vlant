import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Trạng thái ban đầu
const initialState = {
  posts: [], // Mảng chứa tất cả bài viết
  status: "idle",
  error: null, // Lưu lỗi nếu có
  createStatus: "idle",
  comments: [],
  commentsStatus: 'idle', 
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

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      // Gọi API like/unlike
      const { data } = await api.put(`/posts/${postId}/like`);
      // Trả về bài viết đã được cập nhật từ server
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not update like.');
    }
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not fetch comments.');
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content, isAnonymous }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content, isAnonymous });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Could not add comment.');
    }
  }
);


// --- Slice Definition ---

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // Reducer để xóa comments khi modal đóng, tránh hiển thị nhầm
    clearComments: (state) => {
      state.comments = [];
      state.commentsStatus = 'idle';
    }
  },
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
      })

      .addCase(likePost.fulfilled, (state, action) => {
        // action.payload ở đây là bài viết đã được cập nhật từ server
        const updatedPost = action.payload;
        // Tìm vị trí của bài viết trong mảng state.posts
        const index = state.posts.findIndex(post => post._id === updatedPost._id);
        
        // Nếu tìm thấy, thay thế bài viết cũ bằng bài viết mới
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        // Có thể hiển thị lỗi bằng toast notification thay vì ghi đè error chung
        console.error("Like post failed:", action.payload);
      })

      // fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.commentsStatus = 'loading';
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.commentsStatus = 'succeeded';
        state.comments = action.payload; // Lưu danh sách comments vào state
      })
      .addCase(fetchComments.rejected, (state) => {
        state.commentsStatus = 'failed';
      })

      // add comments
      .addCase(addComment.fulfilled, (state, action) => {
        // Thêm comment mới vào đầu danh sách
        state.comments.unshift(action.payload);
        // Cập nhật số đếm comment trên bài viết tương ứng trong `state.posts`
        const postId = action.payload.post;
        const postIndex = state.posts.findIndex(p => p._id === postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentCount += 1;
        }
      });
  },
});

export const { clearComments } = postSlice.actions;
export default postSlice.reducer;

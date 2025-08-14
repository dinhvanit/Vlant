import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Trạng thái ban đầu
const initialState = {
  posts: [],      // Mảng chứa tất cả bài viết
  loading: false, // Trạng thái đang tải dữ liệu
  error: null,    // Lưu lỗi nếu có
};

// --- Async Thunks ---

// Thunk để lấy (fetch) tất cả bài viết từ server
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/posts');
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Could not fetch posts.');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/posts', postData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'Could not create post.');
    }
  }
);

// --- Slice Definition ---

export const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {}, // Không cần reducer đồng bộ lúc này
  extraReducers: (builder) => {
    builder
      // Xử lý các trạng thái của fetchPosts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload; // Cập nhật mảng posts với dữ liệu từ API
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Lưu lại thông báo lỗi
      })
      
    //   .addCase(createPost.pending, (state) => {
        // Có thể set một state loading riêng cho việc tạo bài viết nếu muốn
    //   })
      .addCase(createPost.fulfilled, (state, action) => {
        // Thêm bài viết mới vào ĐẦU mảng posts hiện tại
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default postSlice.reducer;
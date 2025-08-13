import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Lấy thông tin user từ localStorage nếu có để duy trì đăng nhập
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

// Trạng thái ban đầu của slice
const initialState = {
  userInfo: userInfoFromStorage,
  loading: false,
  error: null,
};

// --- Async Thunks ---

// Async Thunk cho việc ĐĂNG NHẬP
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Gọi API đăng nhập
      const { data } = await api.post('/auth/login', credentials);
      // Lưu thông tin người dùng vào localStorage để duy trì đăng nhập
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (err) {
      // Nếu có lỗi, trả về thông điệp lỗi từ server
      return rejectWithValue(err.response.data);
    }
  }
);

// Async Thunk cho việc ĐĂNG XUẤT
export const logout = createAsyncThunk(
  'auth/logout', 
  async (_, { rejectWithValue }) => {
    try {
      // Gọi API đăng xuất để server xóa httpOnly cookie
      await api.post('/auth/logout');
      // Xóa thông tin người dùng khỏi localStorage
      localStorage.removeItem('userInfo');
    } catch (err) {
      // Thậm chí nếu API lỗi, chúng ta vẫn muốn logout ở client
      // nên chỉ log lỗi ra và không reject
      console.error("Logout API call failed:", err);
      localStorage.removeItem('userInfo'); // Vẫn xóa localStorage để đảm bảo logout
      return rejectWithValue(err.response.data);
    }
});

// --- Slice Definition ---

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  // 'reducers' dùng cho các action đồng bộ, không cần cho login/logout nữa
  reducers: {}, 
  // 'extraReducers' dùng để xử lý các trạng thái của async thunks (pending, fulfilled, rejected)
  extraReducers: (builder) => {
    builder
      // Xử lý cho action 'login'
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Invalid credentials';
      })
      // Xử lý cho action 'logout'
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null; // Xóa thông tin người dùng khỏi Redux state
        state.loading = false;
        state.error = null;
      });
  },
});


export default authSlice.reducer;
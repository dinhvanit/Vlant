import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  conversations: [],
  conversationsStatus: 'idle',
  messages: [],
  messagesStatus: 'idle',
  error: null,
};

// --- Async Thunks ---
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/messages/conversations');
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (otherUserId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/messages/${otherUserId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// --- Slice Definition ---
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Reducer để thêm tin nhắn mới nhận từ socket
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
      state.messagesStatus = 'idle';
    },
    addOrUpdateConversation: (state, action) => {
        const newConversation = action.payload;
        const index = state.conversations.findIndex(c => c._id === newConversation._id);
        if (index !== -1) {
            // Nếu đã có, cập nhật nó (ví dụ khi có tin nhắn mới)
            state.conversations[index] = newConversation;
        } else {
            // Nếu chưa có, thêm vào đầu danh sách
            state.conversations.unshift(newConversation);
        }
    }
  },
  extraReducers: (builder) => {
    builder
      // Cases for fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsStatus = 'loading';
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsStatus = 'succeeded';
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state) => {
        state.conversationsStatus = 'failed';
      })
      // Cases for fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesStatus = 'loading';
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesStatus = 'succeeded';
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state) => {
        state.messagesStatus = 'failed';
      });
  },
});

export const { addMessage, clearMessages, addOrUpdateConversation } = chatSlice.actions;
export default chatSlice.reducer;
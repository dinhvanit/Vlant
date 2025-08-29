import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthModalOpen: false,
  pendingAction: null, 
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.isAuthModalOpen = true;
      state.pendingAction = action.payload || null; // Nhận hành động chờ nếu có
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.pendingAction = null; // Xóa hành động chờ khi đóng modal
    },

    openPostModal: (state, action) => {
      state.viewingPostId = action.payload; // payload sẽ là postId
    },
    closePostModal: (state) => {
      state.viewingPostId = null;
    },
  },
});

export const { openAuthModal, closeAuthModal, openPostModal, closePostModal } = uiSlice.actions;
export default uiSlice.reducer;
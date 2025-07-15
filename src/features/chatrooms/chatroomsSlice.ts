import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Chatroom {
  id: string;
  title: string;
  createdAt: number;
}

interface ChatroomsState {
  chatrooms: Chatroom[];
}

const initialState: ChatroomsState = {
  chatrooms: [],
};

const chatroomsSlice = createSlice({
  name: 'chatrooms',
  initialState,
  reducers: {
    setChatrooms(state, action: PayloadAction<Chatroom[]>) {
      state.chatrooms = action.payload;
    },
    addChatroom(state, action: PayloadAction<Chatroom>) {
      state.chatrooms.unshift(action.payload);
    },
    deleteChatroom(state, action: PayloadAction<string>) {
      state.chatrooms = state.chatrooms.filter(c => c.id !== action.payload);
    },
  },
});

export const { setChatrooms, addChatroom, deleteChatroom } = chatroomsSlice.actions;
export default chatroomsSlice.reducer; 
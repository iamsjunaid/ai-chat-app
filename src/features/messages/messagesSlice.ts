import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  chatroomId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: number;
  image?: string;
}

interface MessagesState {
  messages: Message[];
}

const initialState: MessagesState = {
  messages: [],
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    prependMessages(state, action: PayloadAction<Message[]>) {
      state.messages = [...action.payload, ...state.messages];
    },
  },
});

export const { setMessages, addMessage, prependMessages } = messagesSlice.actions;
export default messagesSlice.reducer;

// Memoized selector for messages by chatroomId
export const selectMessagesByChatroomId = createSelector(
  [
    (state: { messages: MessagesState }) => state.messages.messages,
    (_state: { messages: MessagesState }, chatroomId: string) => chatroomId
  ],
  (messages, chatroomId) => messages.filter(m => m.chatroomId === chatroomId)
); 
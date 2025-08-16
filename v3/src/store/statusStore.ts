import { create } from 'zustand';

export type StatusType = 'info' | 'error' | 'loading' | 'success';

export interface StatusMessage {
  id: string;
  message: string;
  type: StatusType;
}

interface StatusState {
  messages: StatusMessage[];
  addMessage: (message: Omit<StatusMessage, 'id'>) => void;
  removeMessage: (id: string) => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  messages: [],
  addMessage: (message) => {
    const id = new Date().toISOString() + Math.random();
    set((state) => ({ messages: [...state.messages, { ...message, id }] }));
  },
  removeMessage: (id) =>
    set((state) => ({ messages: state.messages.filter((msg) => msg.id !== id) })),
}));

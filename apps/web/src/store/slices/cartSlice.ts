import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  vendorId: string;
  title: string;
  price: number;
  imageUrl: string;
  artist: string;
  availableQuantity: number;
  quantity: number;
}

interface CartState {
  // Keyed by userId. Guest cart can use 'guest' as key.
  itemsByUserId: Record<string, CartItem[]>;
}

const initialState: CartState = {
  itemsByUserId: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{ item: Omit<CartItem, 'quantity'>; userId: string }>,
    ) => {
      const { item: newItem, userId } = action.payload;
      if (!state.itemsByUserId) {
        state.itemsByUserId = {};
      }
      if (!state.itemsByUserId[userId]) {
        state.itemsByUserId[userId] = [];
      }

      const existingItem = state.itemsByUserId[userId].find((item) => item.id === newItem.id);
      if (existingItem) {
        if (existingItem.quantity < newItem.availableQuantity) {
          existingItem.quantity++;
        }
      } else {
        if (newItem.availableQuantity > 0) {
          state.itemsByUserId[userId].push({ ...newItem, quantity: 1 });
        }
      }
    },
    removeItem: (state, action: PayloadAction<{ id: string; userId: string }>) => {
      const { id, userId } = action.payload;
      if (state.itemsByUserId && state.itemsByUserId[userId]) {
        state.itemsByUserId[userId] = state.itemsByUserId[userId].filter((item) => item.id !== id);
      }
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number; userId: string }>,
    ) => {
      const { id, quantity, userId } = action.payload;
      const userItems = state.itemsByUserId?.[userId];
      if (userItems) {
        const item = userItems.find((item) => item.id === id);
        if (item) {
          if (quantity > 0 && quantity <= item.availableQuantity) {
            item.quantity = quantity;
          } else if (quantity > item.availableQuantity) {
            item.quantity = item.availableQuantity;
          }
        }
      }
    },
    clearCart: (state, action: PayloadAction<string>) => {
      if (!state.itemsByUserId) {
        state.itemsByUserId = {};
      }
      state.itemsByUserId[action.payload] = [];
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

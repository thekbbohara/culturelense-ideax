import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  availableQuantity: number;
  artist: string;
  isNew?: boolean;
  inStock?: boolean;
}

interface WishlistState {
  // Keyed by userId
  itemsByUserId: Record<string, WishlistItem[]>;
}

const initialState: WishlistState = {
  itemsByUserId: {},
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<{ item: WishlistItem; userId: string }>) => {
      const { item: newItem, userId } = action.payload;
      if (!state.itemsByUserId) {
        state.itemsByUserId = {};
      }
      if (!state.itemsByUserId[userId]) {
        state.itemsByUserId[userId] = [];
      }

      const index = state.itemsByUserId[userId].findIndex((item) => item.id === newItem.id);
      if (index >= 0) {
        // Remove if exists
        state.itemsByUserId[userId].splice(index, 1);
      } else {
        // Add if doesn't exist
        state.itemsByUserId[userId].push(newItem);
      }
    },
    clearWishlist: (state, action: PayloadAction<string>) => {
      if (!state.itemsByUserId) {
        state.itemsByUserId = {};
      }
      state.itemsByUserId[action.payload] = [];
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

/**
 * Global State - Shared signals accessible across all screens
 * This demonstrates how signals can be used for app-wide state management
 */

import { createSignal, createComputed } from 'signalforge';

// User Profile
export interface User {
  name: string;
  email: string;
  points: number;
  avatar: string;
}

export const currentUser = createSignal<User>({
  name: 'Guest',
  email: 'guest@example.com',
  points: 100,
  avatar: '👤',
});

// Shopping Cart
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const cartItems = createSignal<CartItem[]>([]);

// Computed values that auto-update
export const cartTotal = createComputed(() => 
  cartItems.get().reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

export const cartItemCount = createComputed(() => 
  cartItems.get().reduce((sum, item) => sum + item.quantity, 0)
);

export const userDisplayName = createComputed(() => {
  const user = currentUser.get();
  return user.name === 'Guest' ? 'Guest User' : user.name;
});

// Actions - Helper functions to modify state
export const updateUserName = (name: string) => {
  currentUser.set({ ...currentUser.get(), name });
};

export const updateUserEmail = (email: string) => {
  currentUser.set({ ...currentUser.get(), email });
};

export const addPoints = (points: number) => {
  const user = currentUser.get();
  currentUser.set({ ...user, points: user.points + points });
};

export const deductPoints = (points: number) => {
  const user = currentUser.get();
  const newPoints = Math.max(0, user.points - points);
  currentUser.set({ ...user, points: newPoints });
};

export const addToCart = (item: Omit<CartItem, 'quantity'>) => {
  const items = cartItems.get();
  const existing = items.find(i => i.id === item.id);
  
  if (existing) {
    cartItems.set(
      items.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  } else {
    cartItems.set([...items, { ...item, quantity: 1 }]);
  }
};

export const removeFromCart = (itemId: string) => {
  cartItems.set(cartItems.get().filter(item => item.id !== itemId));
};

export const updateCartItemQuantity = (itemId: string, quantity: number) => {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  
  cartItems.set(
    cartItems.get().map(item =>
      item.id === itemId ? { ...item, quantity } : item
    )
  );
};

export const clearCart = () => {
  cartItems.set([]);
};

export const completeCheckout = () => {
  const total = cartTotal.get();
  const user = currentUser.get();
  
  if (user.points >= total) {
    deductPoints(Math.floor(total));
    clearCart();
    return { success: true, message: 'Order completed successfully!' };
  } else {
    return { success: false, message: 'Not enough points!' };
  }
};

"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from "react";
import { CartItem, Product } from "@/lib/types";
import { useAuth } from "@/lib/authContext";
import { loadCartFS, saveCartFS } from "@/lib/firestore";
import { useRouter } from "next/navigation";

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "ADD"; product: Product; qty?: number }
  | { type: "REMOVE"; id: number }
  | { type: "UPDATE_QTY"; id: number; quantity: number }
  | { type: "CLEAR" }
  | { type: "LOAD"; items: CartItem[] }
  | { type: "TOGGLE_SELECT"; id: number }
  | { type: "SELECT_ALL"; selected: boolean }
  | { type: "REMOVE_MANY"; ids: number[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const qty = action.qty ?? 1;
      const existing = state.items.find((i) => i.id === action.product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.product.id ? { ...i, quantity: i.quantity + qty } : i
          ),
        };
      }
      // New items are selected by default so they are included in checkout
      return { items: [...state.items, { ...action.product, quantity: qty, selected: true }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.quantity <= 0) return { items: state.items.filter((i) => i.id !== action.id) };
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    case "LOAD":
      // Legacy carts have no selected flag - default every item to selected
      return { items: action.items.map((i) => ({ ...i, selected: i.selected !== false })) };
    case "TOGGLE_SELECT":
      return {
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, selected: !i.selected } : i
        ),
      };
    case "SELECT_ALL":
      return { items: state.items.map((i) => ({ ...i, selected: action.selected })) };
    case "REMOVE_MANY":
      return { items: state.items.filter((i) => !action.ids.includes(i.id)) };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  selectedItems: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  removeItems: (ids: number[]) => void;
  toggleSelect: (id: number) => void;
  selectAll: (selected: boolean) => void;
  totalItems: number;
  totalPrice: number;
  cartTotal: number;
  selectedCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { user, loading } = useAuth();
  const router = useRouter();

  // To avoid infinite loops saving when we just loaded
  const isInitialLoad = useRef(true);

  // Load cart from Firestore when user logs in
  useEffect(() => {
    if (loading) return;
    if (user) {
      isInitialLoad.current = true;
      loadCartFS(user.uid).then((items) => {
        dispatch({ type: "LOAD", items });
        // After loading, next state changes will trigger a save
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      });
    } else {
      dispatch({ type: "LOAD", items: [] }); // Clear cart on logout
    }
  }, [user, loading]);

  // Save cart to Firestore when it changes (the selected flag lives on each item)
  useEffect(() => {
    if (loading || !user || isInitialLoad.current) return;
    saveCartFS(user.uid, state.items).catch(console.error);
  }, [state.items, user, loading]);

  const requireAuth = () => {
    if (!user && !loading) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const selectedItems = state.items.filter((i) => i.selected !== false);
  const selectedCount = selectedItems.length;
  const totalPrice = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartTotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        selectedItems,
        addToCart: (product, qty) => {
          if (requireAuth()) dispatch({ type: "ADD", product, qty });
        },
        removeFromCart: (id) => {
          if (requireAuth()) dispatch({ type: "REMOVE", id });
        },
        updateQuantity: (id, quantity) => {
          if (requireAuth()) dispatch({ type: "UPDATE_QTY", id, quantity });
        },
        clearCart: () => {
          if (requireAuth()) dispatch({ type: "CLEAR" });
        },
        removeItems: (ids) => {
          if (requireAuth()) dispatch({ type: "REMOVE_MANY", ids });
        },
        toggleSelect: (id) => {
          if (requireAuth()) dispatch({ type: "TOGGLE_SELECT", id });
        },
        selectAll: (selected) => {
          if (requireAuth()) dispatch({ type: "SELECT_ALL", selected });
        },
        totalItems,
        totalPrice,
        cartTotal,
        selectedCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
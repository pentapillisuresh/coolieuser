import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

import * as cartApi from "../../services/api/cart";
import { getUser } from "../utils/storage";

// -------------------- Types --------------------

interface User {
  id: number | string;
}

interface CartItem {
  id: number;
  quantity: number;
  unitPrice?: number | string;
  lineTotal?: number | string;
  addressId?: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  details?: Record<string, unknown>;
  Service?: Record<string, unknown>;
  [key: string]: unknown;
}

interface Cart {
  id: number;
  Items: CartItem[];
  subtotal: number | string;
  discountAmount?: number | string;
  gstAmount?: number | string;
  convenienceCharges?: number | string;
  totalAmount: number | string;
  [key: string]: unknown;
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  gstAmount: number;
  convenienceCharges: number;
  totalAmount: number;
  loading: boolean;
  mutating: boolean;
  refresh: () => Promise<void>;
  addItem: (payload: Record<string, unknown>) => Promise<Cart | null>;
  updateItem: (
    itemId: number,
    patch: Record<string, unknown>,
  ) => Promise<Cart | null>;
  removeItem: (itemId: number) => Promise<Cart | null>;
  clear: () => Promise<void>;
  patchCart: (patch: Record<string, unknown>) => Promise<Cart | null>;
  checkout: (payload: Record<string, unknown>) => Promise<any>;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextType | null>(null);

// -------------------- Provider --------------------

export function CartProvider({ children }: CartProviderProps) {
  const [userId, setUserId] = useState<number | string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  useEffect(() => {
    console.log("🟢 CartProvider MOUNTED");
    return () => console.log("🔴 CartProvider UNMOUNTED");
  }, []);

  // ── Load logged-in user ──────────────────────────────────
  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      try {
        const user: User | null = await getUser();
        if (active) setUserId(user?.id ?? null);
      } catch (error) {
        console.error("User fetch error:", error);
        if (active) setUserId(null);
      } finally {
        if (active) setUserLoaded(true);
      }
    };

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  // ── Refresh cart ─────────────────────────────────────────
  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) {
      setCart(null);
      return;
    }

    setLoading(true);
    try {
      const c = (await cartApi.getCart()) as Cart;
      setCart((prev) => {
        if (!c || typeof c !== "object") return prev;
        return {
          ...c,
          Items: (c as any).Items ?? prev?.Items ?? [],
        } as Cart;
      });
    } catch (error) {
      console.error("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userLoaded) refresh();
  }, [userLoaded, refresh]);

  // ── Mutations ────────────────────────────────────────────
  const addItem = useCallback(
    async (payload: Record<string, unknown>): Promise<Cart | null> => {
      setMutating(true);
      try {
        const c = (await cartApi.addItemToCart(payload)) as Cart;
        console.log("🛒 cart after addItem:", {
          id: (c as any)?.id,
          itemsLen: (c as any)?.Items?.length,
        });
        setCart(c);
        return c;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const updateItem = useCallback(
    async (
      itemId: number,
      patch: Record<string, unknown>,
    ): Promise<Cart | null> => {
      setMutating(true);
      try {
        const c = (await cartApi.updateCartItem(itemId, patch)) as Cart;
        setCart(c);
        return c;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const removeItem = useCallback(
    async (itemId: number): Promise<Cart | null> => {
      setMutating(true);
      try {
        const c = (await cartApi.removeCartItem(itemId)) as Cart;
        setCart(c);
        return c;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const clear = useCallback(async (): Promise<void> => {
    setMutating(true);
    try {
      await cartApi.clearCart();
      setCart((current) =>
        current
          ? {
              ...current,
              Items: [],
              subtotal: 0,
              discountAmount: 0,
              gstAmount: 0,
              convenienceCharges: 0,
              totalAmount: 0,
            }
          : current,
      );
    } finally {
      setMutating(false);
    }
  }, []);

  const patchCart = useCallback(
    async (patch: Record<string, unknown>): Promise<Cart | null> => {
      setMutating(true);
      try {
        const incoming = (await cartApi.updateCart(patch)) as Cart;

        // Merge: keep previous Items if the response omitted them.
        setCart((prev) => {
          if (!incoming || typeof incoming !== "object") return prev;
          const items =
            (incoming as any).Items?.length
              ? (incoming as any).Items
              : (prev?.Items ?? []);
          return { ...(prev ?? {}), ...incoming, Items: items } as Cart;
        });

        return incoming;
      } finally {
        setMutating(false);
      }
    },
    [],
  );

  const checkout = useCallback(
    async (payload: Record<string, unknown>): Promise<any> => {
      setMutating(true);
      try {
        const result = await cartApi.checkoutCart(payload);

        // Clear local cart — the active cart was 'converted' server-side.
        setCart((prev) =>
          prev
            ? {
                ...prev,
                Items: [],
                subtotal: 0,
                discountAmount: 0,
                gstAmount: 0,
                convenienceCharges: 0,
                totalAmount: 0,
              }
            : prev,
        );

        // Non-blocking: pick up a fresh active cart if one is auto-created.
        refresh().catch(() => {});

        return result;
      } finally {
        setMutating(false);
      }
    },
    [refresh],
  );

  // ── Derived values ───────────────────────────────────────
  const items: CartItem[] = cart?.Items ?? [];

  const itemsCount = items.reduce(
    (count, item) => count + (Number(item.quantity) || 0),
    0,
  );

  const subtotal = Number(cart?.subtotal ?? 0) || 0;
  const discountAmount = Number(cart?.discountAmount ?? 0) || 0;
  const gstAmount = Number(cart?.gstAmount ?? 0) || 0;
  const convenienceCharges = Number(cart?.convenienceCharges ?? 0) || 0;
  const totalAmount = Number(cart?.totalAmount ?? 0) || 0;

  // ── Context value ────────────────────────────────────────
  const value = useMemo<CartContextType>(
    () => ({
      cart,
      items,
      itemsCount,
      subtotal,
      discountAmount,
      gstAmount,
      convenienceCharges,
      totalAmount,
      loading,
      mutating,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
      patchCart,
      checkout,
    }),
    [
      cart,
      items,
      itemsCount,
      subtotal,
      discountAmount,
      gstAmount,
      convenienceCharges,
      totalAmount,
      loading,
      mutating,
      refresh,
      addItem,
      updateItem,
      removeItem,
      clear,
      patchCart,
      checkout,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// -------------------- Hook --------------------

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
};
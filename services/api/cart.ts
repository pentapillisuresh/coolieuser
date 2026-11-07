// services/api/cart.ts
import client from "./client";

/**
 * Normalize whatever the axios interceptor or backend returns:
 *   - { data: { success, data: cart } }   (raw axios)
 *   - { success, data: cart }             (interceptor 1x)
 *   - cart                                (already unwrapped)
 *   - { success, data: { items: [...] }}  (if backend uses lowercase)
 */
const unwrap = (res: any) => {
  const body = res?.data ?? res;

  // {success, data} envelope → dig one level
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    body.data &&
    typeof body.data === "object"
  ) {
    return body.data;
  }

  return body;
};

export const getCart = () =>
  client.get("/cart").then(unwrap);

export const addItemToCart = (payload: any) =>
  client.post("/cart/items", payload).then(unwrap);

export const updateCartItem = (itemId: number, patch: any) =>
  client.put(`/cart/items/${itemId}`, patch).then(unwrap);

export const removeCartItem = (itemId: number) =>
  client.delete(`/cart/items/${itemId}`).then(unwrap);

export const clearCart = () =>
  client.delete("/cart").then(unwrap);

export const updateCart = (patch: any) =>
  client.patch("/cart", patch).then(unwrap);

export const checkoutCart = (payload: any) =>
  client.post("/cart/checkout", payload).then(unwrap);
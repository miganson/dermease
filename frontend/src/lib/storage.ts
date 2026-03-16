import type { AuthSession, CartItem } from "../types/domain";

const AUTH_KEY = "dermease_auth";
const CART_KEY = "dermease_cart";

export function loadStoredSession(): AuthSession | null {
  try {
    const value = localStorage.getItem(AUTH_KEY);
    return value ? (JSON.parse(value) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function persistSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function loadStoredCart(): CartItem[] {
  try {
    const value = localStorage.getItem(CART_KEY);
    return value ? (JSON.parse(value) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function persistCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}


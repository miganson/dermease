import { createContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import { loadStoredCart, persistCart } from "../lib/storage";
import type { CartItem, Product } from "../types/domain";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredCart());

  useEffect(() => {
    persistCart(items);
  }, [items]);

  function addItem(product: Product, quantity: number) {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product._id);
      if (existing) {
        return current.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.stockQuantity)
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          slug: product.slug,
          imageUrl: product.imageUrl,
          price: product.price,
          stockQuantity: product.stockQuantity,
          quantity
        }
      ];
    });
  }

  function removeItem(productId: string) {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.stockQuantity))
            }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}


'use client';

import React, { createContext, useContext, useState } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    emoji: string;
    selectedOption?: { label: string; priceAddOn: number };
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQty: (id: string, qty: number) => void;
    total: number;
    count: number;
    clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (item: CartItem) => {
        setItems(prev => {
            const key = item.id + (item.selectedOption?.label ?? '');
            const existing = prev.find(i => i.id + (i.selectedOption?.label ?? '') === key);
            if (existing) {
                return prev.map(i =>
                    i.id + (i.selectedOption?.label ?? '') === key
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
    const updateQty = (id: string, qty: number) =>
        setItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: qty } : i));

    const total = items.reduce((s, i) => s + (i.price + (i.selectedOption?.priceAddOn ?? 0)) * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, total, count, clear: () => setItems([]) }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
};

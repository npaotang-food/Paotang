'use client';

import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    emoji: string;
    options?: string[]; // e.g. ["พริกเกลือ", "แช่เย็นจัด"]
    note?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string, optionsHash: string) => void;
    updateQty: (id: string, optionsHash: string, qty: number) => void;
    total: number;
    count: number;
    clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

// Helper to uniquely identify an item variant
const getHash = (item: CartItem) => {
    return `${item.id}-${(item.options || []).sort().join('-')}-${item.note || ''}`;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = (item: CartItem) => {
        setItems(prev => {
            const key = getHash(item);
            const existing = prev.find(i => getHash(i) === key);
            if (existing) {
                return prev.map(i =>
                    getHash(i) === key
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeItem = (id: string, hash: string) => {
        setItems(prev => prev.filter(i => getHash(i) !== hash));
    };

    const updateQty = (id: string, hash: string, qty: number) => {
        setItems(prev =>
            qty <= 0
                ? prev.filter(i => getHash(i) !== hash)
                : prev.map(i => getHash(i) === hash ? { ...i, quantity: qty } : i)
        );
    };

    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
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

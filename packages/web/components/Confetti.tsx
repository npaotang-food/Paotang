'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#F5A623', '#FF8C42', '#34C759', '#007AFF', '#FF3B30', '#FFD700', '#FF69B4', '#A855F7'];

export default function Confetti({ count = 60 }: { count?: number }) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        wrapper.innerHTML = '';
        const pieces: HTMLDivElement[] = [];

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const left = Math.random() * 100;
            const duration = 1.2 + Math.random() * 2;
            const delay = Math.random() * 0.8;
            const rotation = Math.random() * 360;
            const size = 6 + Math.random() * 8;

            piece.style.cssText = `
                left: ${left}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                transform: rotate(${rotation}deg);
            `;
            wrapper.appendChild(piece);
            pieces.push(piece);
        }

        const timer = setTimeout(() => {
            if (wrapper) wrapper.innerHTML = '';
        }, 3500);

        return () => {
            clearTimeout(timer);
            pieces.forEach(p => p.remove());
        };
    }, [count]);

    return <div ref={wrapperRef} className="confetti-wrapper" />;
}

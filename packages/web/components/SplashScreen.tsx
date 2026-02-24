'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
    // 'visible' → 'hiding' → 'gone'
    const [phase, setPhase] = useState<'visible' | 'hiding' | 'gone'>('gone');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (sessionStorage.getItem('splash_shown')) return;
        sessionStorage.setItem('splash_shown', '1');

        const showTimer = setTimeout(() => setPhase('visible'), 0);
        const hideTimer = setTimeout(() => setPhase('hiding'), 3300);
        const goneTimer = setTimeout(() => setPhase('gone'), 3900);
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); clearTimeout(goneTimer); };
    }, []);

    if (phase === 'gone') return null;

    return (
        <>
            <style>{`
                @keyframes splash-pop {
                    0%   { transform: scale(0.5);  opacity: 0; }
                    60%  { transform: scale(1.12); opacity: 1; }
                    80%  { transform: scale(0.95); }
                    100% { transform: scale(1);    opacity: 1; }
                }
                @keyframes splash-slide-up {
                    from { transform: translateY(24px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                @keyframes splash-ripple {
                    0%   { transform: scale(0.8); opacity: 0.6; }
                    100% { transform: scale(2.4); opacity: 0;   }
                }
                @keyframes splash-fade-out {
                    from { opacity: 1; transform: scale(1);    }
                    to   { opacity: 0; transform: scale(1.06); }
                }
                .splash-root {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(160deg, #FF8C42 0%, #F5A623 45%, #E09010 100%);
                    animation: ${phase === 'hiding' ? 'splash-fade-out 0.6s ease forwards' : 'none'};
                }
                .splash-ripple {
                    position: absolute;
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.25);
                    animation: splash-ripple 1.6s ease-out infinite;
                }
                .splash-ripple-2 {
                    animation-delay: 0.5s;
                    background: rgba(255,255,255,0.15);
                }
                .splash-logo-wrap {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow:
                        0 0 0 6px rgba(255,255,255,0.35),
                        0 16px 48px rgba(0,0,0,0.25);
                    animation: splash-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards;
                    opacity: 0;
                }
                .splash-name {
                    margin-top: 20px;
                    font-family: 'Prompt', sans-serif;
                    font-size: 28px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -0.5px;
                    text-shadow: 0 2px 12px rgba(0,0,0,0.15);
                    animation: splash-slide-up 0.5s 0.55s ease forwards;
                    opacity: 0;
                }
                .splash-sub {
                    margin-top: 6px;
                    font-family: 'Prompt', sans-serif;
                    font-size: 14px;
                    color: rgba(255,255,255,0.85);
                    letter-spacing: 1px;
                    animation: splash-slide-up 0.5s 0.7s ease forwards;
                    opacity: 0;
                }
                .splash-dots {
                    display: flex;
                    gap: 7px;
                    margin-top: 40px;
                    animation: splash-slide-up 0.5s 0.9s ease forwards;
                    opacity: 0;
                }
                .splash-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.7);
                    animation: splash-ripple 1.2s ease-in-out infinite;
                }
                .splash-dot:nth-child(2) { animation-delay: 0.2s; }
                .splash-dot:nth-child(3) { animation-delay: 0.4s; }
            `}</style>

            <div className="splash-root">
                {/* Ripple rings behind logo */}
                <div className="splash-ripple" />
                <div className="splash-ripple splash-ripple-2" />

                {/* Logo */}
                <div className="splash-logo-wrap">
                    <Image
                        src="/logo.jpg"
                        alt="เป๋าตังค์"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>

                {/* Store name */}
                <div className="splash-name">เป๋าตังค์</div>
                <div className="splash-sub">ผลไม้ปอกสด ส่งถึงหน้าบ้าน 🍊</div>

                {/* Loading dots */}
                <div className="splash-dots">
                    <div className="splash-dot" />
                    <div className="splash-dot" />
                    <div className="splash-dot" />
                </div>
            </div>
        </>
    );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

/**
 * OrderStatusBanner — แสดง toast notification เมื่อสถานะออเดอร์ของลูกค้าเปลี่ยน
 * วางไว้ใน layout หรือ orders/page.tsx
 * ใช้ Supabase Realtime subscription
 */

type StatusConfig = {
    label: string;
    icon: string;
    color: string;
    sound: boolean;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
    preparing: { label: 'กำลังเตรียมออเดอร์ของคุณ 👨‍🍳', icon: '🍊', color: '#007AFF', sound: false },
    delivering: { label: 'ออเดอร์กำลังส่งถึงคุณแล้ว! 🚴', icon: '🛵', color: '#34C759', sound: true },
    done: { label: 'ออเดอร์ถึงแล้ว! อร่อยนะคะ 🎉', icon: '✅', color: '#FF8C42', sound: true },
    cancelled: { label: 'ออเดอร์ถูกยกเลิก', icon: '❌', color: '#FF3B30', sound: false },
};

type Toast = {
    id: string;
    orderId: string;
    status: string;
    config: StatusConfig;
};

// เล่นเสียง notification ด้วย Web Audio API
function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch {
        // ไม่รองรับ Web Audio API
    }
}

export function OrderStatusNotifier() {
    const { user, isLoggedIn } = useAuth();
    const [toasts, setToasts] = useState<Toast[]>([]);
    const supabase = createClient();

    const addToast = useCallback((orderId: string, status: string) => {
        const config = STATUS_CONFIG[status];
        if (!config) return;
        const toast: Toast = { id: `${orderId}-${Date.now()}`, orderId, status, config };

        setToasts(prev => [...prev, toast]);
        if (config.sound) playNotificationSound();

        // Auto dismiss หลัง 6 วินาที
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 6000);
    }, []);

    useEffect(() => {
        if (!isLoggedIn || !user) return;

        // Supabase Realtime subscription สำหรับออเดอร์ของ user นี้
        const channel = supabase
            .channel(`orders-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newStatus = payload.new.status as string;
                    const orderId = payload.new.id as string;
                    addToast(orderId, newStatus);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isLoggedIn, user, addToast, supabase]);

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
            width: '90%', maxWidth: 400, pointerEvents: 'none',
        }}>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    style={{
                        background: 'white',
                        borderRadius: 16,
                        padding: '14px 18px',
                        boxShadow: `0 4px 24px rgba(0,0,0,0.15), 0 0 0 3px ${toast.config.color}20`,
                        display: 'flex', alignItems: 'center', gap: 12,
                        animation: 'slideDown 0.3s ease',
                        pointerEvents: 'auto',
                        borderLeft: `4px solid ${toast.config.color}`,
                    }}
                >
                    <span style={{ fontSize: 28 }}>{toast.config.icon}</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#2D2D2D' }}>
                            {toast.config.label}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#999' }}>
                            #{toast.orderId.slice(-6).toUpperCase()}
                        </p>
                    </div>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: toast.config.color,
                        boxShadow: `0 0 8px ${toast.config.color}`,
                        animation: 'pulse 1s infinite',
                    }} />
                </div>
            ))}
            <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
        </div>
    );
}

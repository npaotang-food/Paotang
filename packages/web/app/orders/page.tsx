'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'รอยืนยัน', color: '#FF9500', icon: '⏳' },
    preparing: { label: 'กำลังเตรียม', color: '#007AFF', icon: '👨‍🍳' },
    delivering: { label: 'กำลังส่ง', color: '#34C759', icon: '🚴' },
    done: { label: 'สำเร็จ', color: '#8E8E93', icon: '✓' },
};

export default function OrdersPage() {
    const { isLoggedIn } = useAuth();
    const [showLogin, setShowLogin] = useState(false);

    // แสดงหน้าล็อกอิน ถ้ายังไม่ได้เข้าสู่ระบบ
    if (!isLoggedIn) {
        return (
            <>
                <main className="page-content" style={{ padding: '0 0 80px' }}>
                    <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0' }}>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>คำสั่งซื้อ 📋</h1>
                    </div>
                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div style={{ fontSize: 70, marginBottom: 16 }}>📋</div>
                        <h2 style={{ margin: '0 0 8px', color: '#2D2D2D', fontSize: 18 }}>เข้าสู่ระบบก่อนนะ!</h2>
                        <p style={{ color: '#999', marginBottom: 24, fontSize: 14 }}>เพื่อดูประวัติการสั่งซื้อของคุณ</p>
                        <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ maxWidth: 240, margin: '0 auto' }}>
                            เข้าสู่ระบบ / สมัครสมาชิก
                        </button>
                    </div>
                </main>
                {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
                <BottomNav />
            </>
        );
    }

    type OrderItem = { name: string; qty: number; emoji: string };
    type Order = { id: string; date: string; status: string; items: OrderItem[]; total: number };
    // TODO: fetch from Supabase
    const orders: Order[] = [];


    return (
        <>
            <main className="page-content" style={{ padding: '0 0 80px' }}>
                <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0' }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>คำสั่งซื้อ 📋</h1>
                    <p style={{ margin: '4px 0 0', color: '#999', fontSize: 13 }}>
                        {orders.length > 0 ? `ประวัติทั้งหมด ${orders.length} รายการ` : 'ยังไม่มีประวัติการสั่งซื้อ'}
                    </p>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{ fontSize: 60, marginBottom: 12 }}>🧺</div>
                            <p style={{ color: '#999', fontSize: 14 }}>ยังไม่มีคำสั่งซื้อ</p>
                            <p style={{ color: '#BBB', fontSize: 12 }}>เริ่มสั่งผลไม้ปอกอร่อยๆ ได้เลย!</p>
                        </div>
                    ) : (
                        orders.map(order => {
                            const st = STATUS_MAP[order.status];
                            return (
                                <div key={order.id} className="card" style={{ padding: '16px', cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{order.id}</span>
                                            <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>{order.date}</span>
                                        </div>
                                        <span style={{
                                            background: st.color + '20', color: st.color,
                                            borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600,
                                        }}>
                                            {st.icon} {st.label}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                        {order.items.map((item, i) => (
                                            <span key={i} style={{ background: '#F5F5F5', borderRadius: 20, padding: '4px 10px', fontSize: 13 }}>
                                                {item.emoji} {item.name} ×{item.qty}
                                            </span>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#FF8C42', fontWeight: 700, fontSize: 16 }}>฿{order.total}</span>
                                        <button style={{
                                            background: '#FFF3DC', border: 'none', borderRadius: 20,
                                            padding: '6px 16px', color: '#F5A623', fontWeight: 600,
                                            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                                        }}>
                                            สั่งซ้ำ
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
            <BottomNav />
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import OrderReceiptModal from '@/components/OrderReceiptModal';
import { createClient } from '@/lib/supabase/client';

const STATUS_MAP: Record<string, { label: string; icon: string }> = {
    pending: { label: 'รอยืนยัน', icon: '⏳' },
    preparing: { label: 'กำลังเตรียม', icon: '👨‍🍳' },
    delivering: { label: 'กำลังส่ง', icon: '🛵' },
    done: { label: 'สำเร็จ', icon: '✅' },
    cancelled: { label: 'ยกเลิก', icon: '✕' },
};

// Align with OrderReceiptModal typing
interface OrderItem { name: string; qty: number; emoji: string; price: number; options: string[] }
interface Order { id: string; date: string; status: string; items: OrderItem[]; total: number; deliveryFee: number; paymentMethod: string; address: string; distanceKm: number; }

export default function OrdersPage() {
    const { user, isLoggedIn } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchOrders = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, total, delivery_fee, delivery_address, distance_km, status, created_at,
                    order_items ( menu_item_name, menu_item_emoji, quantity, unit_price, options )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data && !error) {
                const formatted: Order[] = data.map((o: any) => ({
                    id: o.id,
                    date: new Date(o.created_at).toLocaleString('th-TH'),
                    status: o.status || 'pending',
                    total: o.total,
                    deliveryFee: o.delivery_fee || 0,
                    paymentMethod: 'Cash on Delivery',
                    address: o.delivery_address || 'รับที่ร้าน',
                    distanceKm: o.distance_km || 0,
                    items: o.order_items ? o.order_items.map((i: any) => ({
                        name: i.menu_item_name,
                        emoji: i.menu_item_emoji,
                        qty: i.quantity,
                        price: i.unit_price,
                        options: i.options || []
                    })) : []
                }));
                setOrders(formatted);
            }
            setIsLoading(false);
        };
        fetchOrders();
    }, [user]);

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

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 80px' }}>
                <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0' }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>คำสั่งซื้อ 📋</h1>
                    <p style={{ margin: '4px 0 0', color: '#999', fontSize: 13 }}>
                        {isLoading ? 'กำลังโหลดข้อมูล...' : (orders.length > 0 ? `ประวัติทั้งหมด ${orders.length} รายการ` : 'ยังไม่มีประวัติการสั่งซื้อ')}
                    </p>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>กำลังโหลดคำสั่งซื้อ... ⏳</div>
                    ) : orders.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">📋</span>
                            <p className="empty-state-title">ยังไม่มีคำสั่งซื้อ</p>
                            <p className="empty-state-subtitle">สั่งผลไม้ปอกสด อร่อยๆ เป็นออเดอร์แรกได้เลย! 🍊</p>
                        </div>
                    ) : (
                        orders.map(order => {
                            const st = STATUS_MAP[order.status] || STATUS_MAP.pending;
                            return (
                                <div key={order.id} className="card" onClick={() => setSelectedOrder(order)} style={{ padding: '16px', cursor: 'pointer', transition: 'transform 0.1s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <div>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>#{order.id.slice(0, 8)}...</span>
                                            <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>{order.date}</span>
                                        </div>
                                        <span className={`status-badge ${order.status}`}>
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
                                            ดูรายละเอียด
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {selectedOrder && (
                <OrderReceiptModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            <BottomNav />
        </>
    );
}

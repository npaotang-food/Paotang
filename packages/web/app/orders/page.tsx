'use client';

import BottomNav from '@/components/BottomNav';

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'รอยืนยัน', color: '#FF9500', icon: '⏳' },
    preparing: { label: 'กำลังเตรียม', color: '#007AFF', icon: '👨‍🍳' },
    delivering: { label: 'กำลังส่ง', color: '#34C759', icon: '🚴' },
    done: { label: 'สำเร็จ', color: '#8E8E93', icon: '✓' },
};

const MOCK_ORDERS = [
    {
        id: 'ORD001',
        date: '20 ก.พ. 2026',
        status: 'done',
        items: [{ name: 'ชาไทยซีส', qty: 2, emoji: '🧋' }, { name: 'ชาชีสลิ้นจี่', qty: 1, emoji: '🍵' }],
        total: 185,
    },
    {
        id: 'ORD002',
        date: '18 ก.พ. 2026',
        status: 'done',
        items: [{ name: 'มัทฉะลาเต้', qty: 1, emoji: '🍃' }, { name: 'พายบานอฟฟี่', qty: 1, emoji: '🍰' }],
        total: 225,
    },
    {
        id: 'ORD003',
        date: '23 ก.พ. 2026',
        status: 'delivering',
        items: [{ name: 'สตอเบอร์รีลาเต้', qty: 2, emoji: '🍓' }],
        total: 70,
    },
];

export default function OrdersPage() {
    return (
        <>
            <main className="page-content" style={{ padding: '0 0 80px' }}>
                <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0' }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>คำสั่งซื้อ 📋</h1>
                    <p style={{ margin: '4px 0 0', color: '#999', fontSize: 13 }}>ประวัติทั้งหมด {MOCK_ORDERS.length} รายการ</p>
                </div>

                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {MOCK_ORDERS.map(order => {
                        const st = STATUS_MAP[order.status];
                        return (
                            <div key={order.id} className="card" style={{ padding: '16px', cursor: 'pointer' }}>
                                {/* Order header */}
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

                                {/* Items */}
                                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                    {order.items.map((item, i) => (
                                        <span key={i} style={{
                                            background: '#F5F5F5', borderRadius: 20,
                                            padding: '4px 10px', fontSize: 13,
                                        }}>
                                            {item.emoji} {item.name} ×{item.qty}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#F5A623', fontWeight: 700, fontSize: 16 }}>฿{order.total}</span>
                                    <button style={{
                                        background: '#FFF3DC', border: 'none', borderRadius: 20,
                                        padding: '6px 16px', color: '#F5A623', fontWeight: 600,
                                        fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                                    }}>
                                        สั่งซ้ำ
                                    </button>
                                </div>

                                {/* Delivering status bar */}
                                {order.status === 'delivering' && (
                                    <div style={{ marginTop: 12, background: '#F5F5F5', borderRadius: 8, padding: '10px 12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            {['✓ ยืนยัน', '👨‍🍳 เตรียม', '🚴 ส่ง', '🎉 ถึงแล้ว'].map((step, i) => (
                                                <div key={i} style={{ textAlign: 'center', fontSize: 11, color: i < 3 ? '#34C759' : '#CCC' }}>
                                                    {step}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ background: '#DDD', borderRadius: 4, height: 4 }}>
                                            <div style={{ background: '#34C759', height: 4, borderRadius: 4, width: '70%', transition: 'width 0.5s' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
            <BottomNav />
        </>
    );
}

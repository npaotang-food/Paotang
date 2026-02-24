'use client';

import { useState } from 'react';
import DeliveryMap from './DeliveryMap';

interface OrderItem {
    name: string;
    qty: number;
    price: number;
    emoji: string;
    options: string[];
}

interface Order {
    id: string;
    date: string;
    status: string;
    items: OrderItem[];
    total: number;
    deliveryFee: number;
    paymentMethod: string;
    address: string;
    distanceKm: number;
}

interface Props {
    order: Order;
    onClose: () => void;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'รอยืนยัน', color: '#FF9500', bg: '#FFF4E5' },
    preparing: { label: 'กำลังเตรียม', color: '#007AFF', bg: '#E5F1FF' },
    delivering: { label: 'กำลังจัดส่ง', color: '#34C759', bg: '#E5F9EB' },
    done: { label: 'สำเร็จ', color: '#00C897', bg: '#E6FAF4' },
    cancelled: { label: 'ยกเลิก', color: '#FF3B30', bg: '#FFEBEA' },
};

export default function OrderReceiptModal({ order, onClose }: Props) {
    const [showMap, setShowMap] = useState(false);
    const st = STATUS_MAP[order.status] || STATUS_MAP.pending;

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.2s', padding: '0 0 20px'
        }}>
            <div style={{
                background: '#F9F9F9', width: '100%', maxHeight: '90vh',
                borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px',
                overflowY: 'auto', position: 'relative',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: 20, right: 20,
                    background: 'transparent', border: 'none', fontSize: 24, color: '#999', cursor: 'pointer'
                }}>✕</button>

                <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700 }}>รายละเอียดคำสั่งซื้อ <span style={{ color: '#777', fontSize: 16 }}>#{order.id.slice(0, 8)}</span></h2>

                {/* Receipt Card */}
                <div style={{
                    background: 'white', borderRadius: 16, padding: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 20
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ color: '#555' }}>สถานะ:</span>
                        <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                            {st.label}
                        </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ color: '#555' }}>วันที่สั่งซื้อ:</span>
                        <span style={{ fontWeight: 600 }}>{order.date}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <span style={{ color: '#555' }}>ประเภท:</span>
                        <span style={{ fontWeight: 600, color: '#F5A623' }}>🛵 จัดส่ง ({order.distanceKm} กม.)</span>
                    </div>

                    <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 16, marginBottom: 16 }}>
                        <div style={{ color: '#777', fontSize: 13, marginBottom: 4 }}>ที่อยู่จัดส่ง</div>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: '#FF3B30' }}>📍</span>
                            <span>{order.address || 'รับที่ร้าน'}</span>
                        </div>
                    </div>

                    <div style={{ borderLeft: '4px solid #F5A623', paddingLeft: 12, fontSize: 16, fontWeight: 700, margin: '24px 0 16px' }}>
                        รายการสินค้า
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: 12 }}>
                                <div style={{
                                    width: 60, height: 60, background: '#00593B', borderRadius: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
                                }}>
                                    {item.emoji}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: 4 }}>
                                        <span>{item.name} ×{item.qty}</span>
                                        <span>{item.price.toFixed(2)} ฿</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13, color: '#777' }}>
                                        {item.options.map((opt, oi) => (
                                            <span key={oi}>• {opt}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px dashed #DDD', margin: '20px 0', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                            <span>ค่าสินค้า</span>
                            <span>{subtotal.toFixed(2)} ฿</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555' }}>
                            <span>ค่าจัดส่ง</span>
                            <span>{order.deliveryFee.toFixed(2)} ฿</span>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #000', margin: '20px 0', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 16, fontWeight: 700 }}>ยอดรวมสุทธิ</span>
                            <span style={{ fontSize: 22, fontWeight: 800, color: '#F5A623' }}>{order.total.toFixed(2)} ฿</span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 13, color: '#777' }}>
                            ชำระโดย: 💵 Cash on Delivery
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <button
                    onClick={() => setShowMap(true)}
                    style={{
                        width: '100%', padding: '16px', background: 'white', border: '1px solid #F5A623',
                        color: '#F5A623', borderRadius: '24px', fontWeight: 700, fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        cursor: 'pointer'
                    }}
                >
                    📍 ดูตำแหน่งจัดส่ง
                </button>
            </div>

            {showMap && (
                <DeliveryMap
                    destLat={13.7563} // Mock coordinates for UI showcase
                    destLng={100.5018}
                    storeLat={13.7500}
                    storeLng={100.5000}
                    addressLabel={order.address}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    );
}

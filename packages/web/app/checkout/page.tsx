'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CheckoutPage() {
    const { items, total, count, clear } = useCart();
    const { user, profile } = useAuth();
    const router = useRouter();

    const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
    const [usePoints, setUsePoints] = useState(false);

    // Delivery fields
    const [addressText, setAddressText] = useState('');
    const [note, setNote] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock distance based on random math or fixed
    const distanceKm = mode === 'delivery' ? 2.5 : 0;
    const deliveryFee = mode === 'delivery' ? 15 + Math.floor(distanceKm * 10) : 0; // Base 15 + 10/km

    const pointsAvailable = profile?.points || 0;
    const pointsDiscount = usePoints ? Math.floor(pointsAvailable * 0.1) : 0;
    const finalTotal = Math.max(0, total + deliveryFee - pointsDiscount);

    const supabase = createClient();

    const handleOrder = async () => {
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
            return;
        }
        if (mode === 'delivery' && !addressText.trim()) {
            alert('กรุณาระบุที่อยู่จัดส่ง');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total: finalTotal,
                    delivery_fee: deliveryFee,
                    delivery_address: mode === 'delivery' ? addressText.trim() : 'รับที่ร้าน',
                    distance_km: distanceKm,
                    note: note.trim() || null,
                    use_points: usePoints,
                    points_used: pointsDiscount > 0 ? pointsAvailable : 0,
                    status: 'pending'
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create order items with options
            const orderItemsInsert = items.map(item => ({
                order_id: order.id,
                menu_item_id: item.id,
                menu_item_name: item.name,
                menu_item_emoji: item.emoji,
                quantity: item.quantity,
                unit_price: item.price,
                options: item.options || []
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItemsInsert);

            if (itemsError) throw itemsError;

            clear();
            router.push('/orders');
        } catch (error) {
            console.error('Error submitting order', error);
            alert('เกิดคำขอผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง (อย่าลืมรันโค้ด SQL Migration)');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (count === 0 && !isSubmitting) {
        return (
            <>
                <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
                    <h2 style={{ margin: '0 0 8px' }}>ตะกร้าว่างเปล่า</h2>
                    <p style={{ color: '#999', marginBottom: 24 }}>เพิ่มเมนูที่ชอบก่อนนะครับ</p>
                    <button className="btn-primary" onClick={() => router.push('/')} style={{ maxWidth: 240 }}>
                        เลือกเมนู
                    </button>
                </div>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 100px' }}>
                {/* Header tabs */}
                <div style={{
                    background: 'white', padding: '16px 16px 0',
                    borderBottom: '1px solid #F0F0F0',
                    display: 'flex', alignItems: 'center', gap: 8,
                }}>
                    <button onClick={() => router.back()} style={{
                        background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4,
                    }}>✕</button>
                    <div style={{ flex: 1, display: 'flex', gap: 0, background: '#F5F5F5', borderRadius: 12, padding: 4 }}>
                        {(['delivery', 'pickup'] as const).map(m => (
                            <button key={m} onClick={() => setMode(m)} style={{
                                flex: 1, padding: '8px 0', border: 'none', cursor: 'pointer',
                                borderRadius: 10, fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                                background: mode === m ? 'white' : 'transparent',
                                color: mode === m ? '#F5A623' : '#777',
                                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s',
                            }}>
                                {m === 'delivery' ? '🚴 จัดส่ง' : '🏪 รับที่ร้าน'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details panel */}
                <div style={{ padding: '16px' }}>
                    {/* Points toggle */}
                    <div style={{
                        background: '#FFFBF0', border: '1px solid #FFE5A0', borderRadius: 14,
                        padding: '14px 16px', marginBottom: 12,
                        display: 'flex', alignItems: 'center', gap: 12,
                        opacity: pointsAvailable > 0 ? 1 : 0.5,
                        pointerEvents: pointsAvailable > 0 ? 'auto' : 'none',
                    }}>
                        <span style={{ fontSize: 24 }}>🪙</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>ใช้คะแนนสะสมแลกส่วนลด</p>
                            <p style={{ margin: '2px 0 0', color: '#999', fontSize: 12 }}>
                                คุณมี {pointsAvailable} คะแนน (ลดได้ ฿{Math.floor(pointsAvailable * 0.1)})
                            </p>
                        </div>
                        <div
                            onClick={() => setUsePoints(!usePoints)}
                            style={{
                                width: 48, height: 28, borderRadius: 14,
                                background: usePoints ? '#F5A623' : '#DDD',
                                position: 'relative', cursor: 'pointer', transition: 'background 0.3s',
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                width: 22, height: 22, borderRadius: '50%', background: 'white',
                                position: 'absolute', top: 3,
                                left: usePoints ? 22 : 3,
                                transition: 'left 0.3s',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                            }} />
                        </div>
                    </div>

                    {/* Summary row */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        {[
                            { label: 'ค่าอาหาร', value: `฿${total}` },
                            { label: 'ค่าจัดส่ง', value: mode === 'delivery' ? `฿${deliveryFee}` : 'ฟรี', color: mode === 'delivery' ? '#2D2D2D' : '#4A9B5E' },
                            { label: 'รวมทั้งหมด', value: `฿${finalTotal}`, color: '#F5A623' },
                        ].map(s => (
                            <div key={s.label} style={{ flex: 1, textAlign: 'center', background: 'white', borderRadius: 12, padding: '10px 4px', border: '1px solid #F5F5F5' }}>
                                <p style={{ margin: 0, color: '#999', fontSize: 11 }}>{s.label}</p>
                                <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 14, color: s.color ?? '#2D2D2D' }}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Address Input */}
                    {mode === 'delivery' && (
                        <div style={{ border: '1px solid #EDEDED', borderRadius: 14, padding: '14px 16px', marginBottom: 12, background: 'white' }}>
                            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>ที่อยู่จัดส่ง</p>
                            <textarea
                                className="input-field"
                                value={addressText}
                                onChange={e => setAddressText(e.target.value)}
                                placeholder="พิมพ์ที่อยู่จัดส่งให้ชัดเจน ระบุจุดสังเกต..."
                                style={{ height: 60, resize: 'none', marginBottom: 0, background: '#F9F9F9', border: 'none', padding: '10px' }}
                            />
                        </div>
                    )}

                    {/* Note */}
                    <div style={{ border: '1px solid #EDEDED', borderRadius: 14, padding: '14px 16px', marginBottom: 12, background: 'white' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>หมายเหตุถึงคนขับ/ร้าน</p>
                        <textarea
                            className="input-field"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                            style={{ height: 60, resize: 'none', marginBottom: 0, background: '#F9F9F9', border: 'none', padding: '10px' }}
                        />
                    </div>
                </div>
            </main>

            {/* Confirm button */}
            <div style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 430, background: 'white',
                borderTop: '1px solid #F0F0F0', padding: '12px 16px 28px', zIndex: 100,
            }}>
                <button
                    className="btn-primary"
                    onClick={handleOrder}
                    disabled={isSubmitting}
                    style={{ background: isSubmitting ? 'linear-gradient(135deg, #4A9B5E, #2D7A45)' : undefined }}
                >
                    {isSubmitting ? '⏳ กำลังส่งคำสั่งซื้อ...' : `ยืนยันการสั่งซื้อ - ฿${finalTotal}`}
                </button>
            </div>
        </>
    );
}

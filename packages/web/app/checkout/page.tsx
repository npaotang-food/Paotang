'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

const ADDRESSES = [
    { id: '1', label: 'บ้านพี่', detail: 'หลังสีเขียว' },
    { id: '2', label: 'ออฟฟิศ', detail: 'ชั้น 5 อาคาร A' },
];

export default function CheckoutPage() {
    const { items, total, count, clear } = useCart();
    const router = useRouter();
    const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
    const [usePoints, setUsePoints] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0]);
    const [showAddrPicker, setShowAddrPicker] = useState(false);
    const [ordered, setOrdered] = useState(false);

    const points = 1516;
    const pointsDiscount = usePoints ? Math.floor(points * 0.1) : 0;
    const finalTotal = Math.max(0, total - pointsDiscount);

    const handleOrder = () => {
        setOrdered(true);
        setTimeout(() => {
            clear();
            router.push('/orders');
        }, 1500);
    };

    if (count === 0 && !ordered) {
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
                    <button style={{
                        background: '#F5F5F5', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, fontSize: 18, cursor: 'pointer',
                    }}>🎯</button>
                </div>

                {/* Map */}
                <div style={{ position: 'relative' }}>
                    <div className="map-placeholder" style={{ borderRadius: 0 }}>
                        <div className="map-lines" />
                        {/* Roads simulation */}
                        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                            <line x1="0" y1="125" x2="100%" y2="125" stroke="#ccc" strokeWidth="12" />
                            <line x1="215" y1="0" x2="215" y2="100%" stroke="#ccc" strokeWidth="8" />
                            <line x1="100" y1="0" x2="80" y2="100%" stroke="#ddd" strokeWidth="6" />
                            <line x1="0" y1="60" x2="100%" y2="80" stroke="#ddd" strokeWidth="6" />
                        </svg>
                        {/* Mascot/User marker */}
                        <div style={{
                            position: 'absolute', left: '38%', top: '38%',
                            fontSize: 32, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
                            animation: 'bounce 2s infinite',
                        }}>🐾</div>
                        {/* Destination marker */}
                        <div style={{
                            position: 'absolute', left: '55%', top: '60%',
                            fontSize: 28, filter: 'drop-shadow(0 2px 6px rgba(245,166,35,0.6))',
                        }}>📍</div>
                    </div>
                </div>

                {/* Details panel */}
                <div style={{ padding: '16px' }}>
                    {/* Points toggle */}
                    <div style={{
                        background: '#FFFBF0', border: '1px solid #FFE5A0', borderRadius: 14,
                        padding: '14px 16px', marginBottom: 12,
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span style={{ fontSize: 24 }}>🪙</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>ใช้คะแนนสะสมแลกส่วนลด</p>
                            <p style={{ margin: '2px 0 0', color: '#999', fontSize: 12 }}>
                                คุณมี 1,516 คะแนน (ลดได้ ฿{Math.floor(1516 * 0.1)})
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
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                        {[
                            { label: 'ระยะทาง', value: '0.9 กม.' },
                            { label: 'ค่าจัดส่ง', value: '฿0', color: '#F5A623' },
                            { label: 'ยอดรวมทั้งหมด', value: `฿${finalTotal}`, color: '#F5A623' },
                        ].map(s => (
                            <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
                                <p style={{ margin: 0, color: '#999', fontSize: 11 }}>{s.label}</p>
                                <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 15, color: s.color ?? '#2D2D2D' }}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Address picker */}
                    <div
                        onClick={() => setShowAddrPicker(!showAddrPicker)}
                        style={{
                            border: '1px solid #EDEDED', borderRadius: 14, padding: '14px 16px',
                            marginBottom: 12, cursor: 'pointer', background: 'white',
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}
                    >
                        <span style={{ fontSize: 22 }}>📍</span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                                {selectedAddress.label} - {selectedAddress.detail}
                            </p>
                        </div>
                        <span style={{ color: '#999', fontSize: 18 }}>
                            {showAddrPicker ? '▲' : '▼'}
                        </span>
                    </div>

                    {showAddrPicker && (
                        <div style={{
                            border: '1px solid #EDEDED', borderRadius: 14, overflow: 'hidden',
                            marginBottom: 12, background: 'white',
                        }}>
                            {ADDRESSES.map((addr, i) => (
                                <div
                                    key={addr.id}
                                    onClick={() => { setSelectedAddress(addr); setShowAddrPicker(false); }}
                                    style={{
                                        padding: '14px 16px',
                                        borderBottom: i < ADDRESSES.length - 1 ? '1px solid #F5F5F5' : 'none',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                                        background: selectedAddress.id === addr.id ? '#FFFBF0' : 'white',
                                    }}
                                >
                                    <span style={{ fontSize: 20 }}>📍</span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{addr.label}</p>
                                        <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{addr.detail}</p>
                                    </div>
                                    {selectedAddress.id === addr.id && <span style={{ marginLeft: 'auto', color: '#F5A623' }}>✓</span>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Note */}
                    <textarea
                        className="input-field"
                        placeholder="หมายเหตุถึงคนส่ง เช่น หลังสีเขียว..."
                        style={{ height: 72, resize: 'none', marginBottom: 0 }}
                    />
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
                    style={{ background: ordered ? 'linear-gradient(135deg, #4A9B5E, #2D7A45)' : undefined }}
                >
                    {ordered ? '✓ สั่งซื้อแล้ว! กำลังเตรียม...' : `ยืนยันการสั่งซื้อ - ฿${finalTotal}`}
                </button>
            </div>
        </>
    );
}

'use client';

import { useCart } from '@/context/CartContext';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MenuDetailModal from '@/components/MenuDetailModal';

const ALL_MENU = [
    { id: '1', name: 'ชาไทยซีส', desc: 'ชาไทยรสเข้มข้น เพิ่มความนัวด้วยชีส', price: 50, emoji: '🧋' },
    { id: '2', name: 'สตอเบอร์รีลาเต้', desc: 'นมสตอเบอร์รีสดชื่น แยกชั้นสวยงาม', price: 35, emoji: '🍓' },
    { id: '3', name: 'ชาชีสลิ้นจี่', desc: 'ชาลิ้นจี่ หอมผลไม้เมืองร้อน', price: 85, emoji: '🍵' },
    { id: '4', name: 'พายบานอฟฟี่', desc: 'พายกล้วยหอมคาราเมล วิปครีม', price: 150, emoji: '🍰' },
    { id: '5', name: 'มัทฉะลาเต้', desc: 'มัทฉะญี่ปุ่นแท้กับนมสด', price: 75, emoji: '🍃' },
    { id: '6', name: 'โฮจิฉะลาเต้', desc: 'ชาโฮจิฉะคั่วหอมกับนมอุ่นๆ', price: 70, emoji: '🌾' },
];

export default function CartPage() {
    const { items, removeItem, updateQty, total, count, clear } = useCart();
    const router = useRouter();
    const [selectedMenu, setSelectedMenu] = useState<typeof ALL_MENU[0] | null>(null);

    if (count === 0) {
        return (
            <>
                <div style={{ padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 80, marginBottom: 16 }}>🛒</div>
                    <h2 style={{ margin: '0 0 8px' }}>ตะกร้าว่างเปล่า</h2>
                    <p style={{ color: '#999', marginBottom: 24 }}>เพิ่มเมนูที่ชอบก่อนเลย!</p>
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
            <main className="page-content" style={{ padding: '0 0 120px' }}>
                {/* Header */}
                <div style={{
                    background: 'white', padding: '20px 16px 16px',
                    borderBottom: '1px solid #F0F0F0',
                    display: 'flex', alignItems: 'center', gap: 12,
                }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>←</button>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>ตะกร้าสินค้า</h1>
                    <button
                        onClick={clear}
                        style={{ background: 'none', border: 'none', color: '#FF3B30', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        ล้างทั้งหมด
                    </button>
                </div>

                <div style={{ padding: '16px' }}>
                    {/* Cart items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                        {items.map((item, i) => (
                            <div key={i} className="menu-card" style={{ cursor: 'default' }}>
                                <div className="menu-card-img">{item.emoji}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                    {item.selectedOption && (
                                        <p style={{ margin: '2px 0', color: '#999', fontSize: 12 }}>{item.selectedOption.label}</p>
                                    )}
                                    <p style={{ margin: '4px 0 0', color: '#F5A623', fontWeight: 700 }}>
                                        ฿{(item.price + (item.selectedOption?.priceAddOn ?? 0)) * item.quantity}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity - 1)}
                                        style={{
                                            width: 30, height: 30, borderRadius: '50%',
                                            border: '1.5px solid #EDEDED', background: 'white',
                                            fontSize: 18, cursor: 'pointer',
                                        }}
                                    >−</button>
                                    <span style={{ fontWeight: 600, fontSize: 15 }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity + 1)}
                                        style={{
                                            width: 30, height: 30, borderRadius: '50%',
                                            background: '#F5A623', border: 'none', color: 'white',
                                            fontSize: 18, cursor: 'pointer',
                                        }}
                                    >+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="card" style={{ padding: '16px' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>สรุปคำสั่งซื้อ</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#777', fontSize: 14 }}>ยอดรวม ({count} รายการ)</span>
                            <span style={{ fontWeight: 600 }}>฿{total}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#777', fontSize: 14 }}>ค่าจัดส่ง</span>
                            <span style={{ fontWeight: 600, color: '#4A9B5E' }}>ฟรี 🎉</span>
                        </div>
                        <div style={{ borderTop: '1px dashed #EDEDED', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>รวมทั้งหมด</span>
                            <span style={{ fontWeight: 800, fontSize: 18, color: '#F5A623' }}>฿{total}</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Checkout button */}
            <div style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 430, background: 'white',
                borderTop: '1px solid #F0F0F0', padding: '12px 16px 28px', zIndex: 100,
            }}>
                <button className="btn-primary" onClick={() => router.push('/checkout')}>
                    ดำเนินการสั่งซื้อ - ฿{total}
                </button>
            </div>
        </>
    );
}

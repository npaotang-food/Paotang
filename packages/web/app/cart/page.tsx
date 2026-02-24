'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function CartPage() {
    const { items, updateQty, total, count, clear } = useCart();
    const { user, profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [phone, setPhone] = useState('');
    const [phoneSaving, setPhoneSaving] = useState(false);

    // Pre-fill phone from profile
    useEffect(() => {
        if (profile && (profile as { phone?: string }).phone) {
            setPhone((profile as { phone?: string }).phone ?? '');
        }
    }, [profile]);

    const savePhone = async () => {
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อนบันทึกเบอร์โทร');
            return;
        }
        if (!phone.trim()) return;

        setPhoneSaving(true);
        const { error } = await supabase.from('profiles').update({ phone: phone.trim() }).eq('id', user.id);
        setPhoneSaving(false);

        if (error) {
            alert('ไม่สามารถบันทึกเบอร์ได้: ' + error.message);
        } else {
            alert('บันทึกเบอร์โทรเรียบร้อยแล้ว');
            router.push('/checkout');
        }
    };

    if (count === 0) {
        return (
            <>
                <main className="page-content" style={{ minHeight: '100vh' }}>
                    <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>←</button>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, flex: 1 }}>ตะกร้าสินค้า</h1>
                    </div>
                    <div className="empty-state">
                        <span className="empty-state-icon">🛒</span>
                        <p className="empty-state-title">ตะกร้าว่างเปล่า</p>
                        <p className="empty-state-subtitle">เลือกผลไม้ปอกสดที่ชอบ<br />แล้วเพิ่มลงตะกร้าได้เลย!</p>
                        <button className="btn-primary" onClick={() => router.push('/')} style={{ maxWidth: 220 }}>
                            🍊 เลือกเมนู
                        </button>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 140px' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        {items.map((item, i) => (
                            <div key={i} className="menu-card" style={{ cursor: 'default' }}>
                                <div className="menu-card-img" style={{ position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            style={{ objectFit: 'cover', borderRadius: 10 }}
                                            unoptimized
                                        />
                                    ) : (
                                        <span style={{ fontSize: 32 }}>{item.emoji}</span>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                    {item.options && item.options.length > 0 && (
                                        <p style={{ margin: '2px 0 0', color: '#777', fontSize: 12 }}>{item.options.join(', ')}</p>
                                    )}
                                    {item.note && (
                                        <p style={{ margin: '2px 0 0', color: '#F5A623', fontSize: 11 }}>📝 {item.note}</p>
                                    )}
                                    <p style={{ margin: '4px 0 0', color: '#FF8C42', fontWeight: 700 }}>
                                        ฿{item.price * item.quantity}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                        onClick={() => updateQty(item.id, `${item.id}-${(item.options || []).sort().join('-')}-${item.note || ''}`, Math.max(0, item.quantity - 1))}
                                        style={{
                                            width: 30, height: 30, borderRadius: '50%',
                                            border: '1.5px solid #EDEDED', background: 'white',
                                            fontSize: 18, cursor: 'pointer',
                                        }}
                                    >−</button>
                                    <span style={{ fontWeight: 600, fontSize: 15 }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, `${item.id}-${(item.options || []).sort().join('-')}-${item.note || ''}`, item.quantity + 1)}
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

                    {/* Phone number field */}
                    <div className="card" style={{ padding: '14px 16px', marginBottom: 12 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>
                            📞 เบอร์โทรติดต่อลูกค้า
                        </label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                onBlur={savePhone}
                                placeholder="0812345678"
                                style={{
                                    flex: 1, padding: '10px 12px',
                                    border: '1.5px solid #EBEBEB', borderRadius: 10,
                                    fontFamily: 'Prompt, sans-serif', fontSize: 14,
                                    outline: 'none', background: '#FAFAFA',
                                }}
                            />
                            <button
                                onClick={(e) => { e.preventDefault(); savePhone(); }}
                                onTouchEnd={(e) => { e.preventDefault(); savePhone(); }}
                                disabled={phoneSaving || !phone.trim()}
                                style={{
                                    padding: '0 14px', borderRadius: 10,
                                    background: phone.trim() ? '#F5A623' : '#EEE',
                                    border: 'none', color: phone.trim() ? 'white' : '#AAA',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                    fontFamily: 'Prompt, sans-serif', whiteSpace: 'nowrap',
                                }}
                            >
                                {phoneSaving ? '...' : 'บันทึก'}
                            </button>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#AAA' }}>
                            คนขับจะใช้เบอร์นี้ติดต่อคุณ
                        </p>
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

            {/* Checkout button — maxWidth 680 matches page-content on desktop */}
            <div style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 680, background: 'white',
                borderTop: '1px solid #F0F0F0', padding: '12px 16px 28px', zIndex: 100,
            }}>
                <button className="btn-primary" onClick={() => router.push('/checkout')}>
                    ดำเนินการสั่งซื้อ - ฿{total}
                </button>
            </div>

            <BottomNav />
        </>
    );
}

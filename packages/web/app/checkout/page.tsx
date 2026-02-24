'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import LoginModal from '@/components/LoginModal';
import MapPicker from '@/components/MapPicker';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface StoreSettings {
    store_lat: number;
    store_lng: number;
    free_delivery_km: number;
    flat_fee_start_km: number;
    flat_fee_end_km: number;
    flat_fee_amount: number;
    base_delivery_fee: number;
    per_km_fee: number;
}

export default function CheckoutPage() {
    const { items, total, count, clear } = useCart();
    const { user, profile } = useAuth();
    const router = useRouter();

    const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
    const [usePoints, setUsePoints] = useState(false);

    // Delivery fields
    const [addressText, setAddressText] = useState('');
    const [pinLabel, setPinLabel] = useState('');           // e.g. "บ้าน", "ที่ทำงาน"
    const [note, setNote] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [savedAddressId, setSavedAddressId] = useState<string | null>(null);
    const [showReusePopup, setShowReusePopup] = useState(false);
    const [savedAddressSnap, setSavedAddressSnap] = useState<{ label: string; detail: string; lat: number; lng: number } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Store Settings
    const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('store_settings').select('*').single();
            if (data) setStoreSettings(data);
        };
        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load saved default address and show reuse popup
    useEffect(() => {
        if (!user) return;
        const loadSavedAddress = async () => {
            const { data } = await supabase
                .from('addresses')
                .select('id, label, detail, lat, lng')
                .eq('user_id', user.id)
                .eq('is_default', true)
                .single();
            if (data?.label) {
                setSavedAddressId(data.id);
                setSavedAddressSnap({ label: data.label, detail: data.detail || '', lat: data.lat, lng: data.lng });
                setShowReusePopup(true);
            }
        };
        loadSavedAddress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const applyReuseAddress = (snap: typeof savedAddressSnap) => {
        if (!snap) return;
        setAddressText(snap.label);
        setPinLabel(snap.detail);
        if (snap.lat && snap.lng) setMapCoords({ lat: snap.lat, lng: snap.lng });
        setShowReusePopup(false);
    };



    let distanceKm = 0;
    let deliveryFee = 0;
    let deliveryMessage = '';

    if (mode === 'delivery' && storeSettings) {
        if (mapCoords) {
            // Rough mock distance calculation based on coordinates
            const dLat = Math.abs(mapCoords.lat - storeSettings.store_lat) * 111;
            const dLng = Math.abs(mapCoords.lng - storeSettings.store_lng) * 111;
            distanceKm = parseFloat(Math.sqrt(dLat * dLat + dLng * dLng).toFixed(1));

            // Apply Rules
            if (distanceKm <= storeSettings.free_delivery_km) {
                deliveryFee = 0;
            } else if (distanceKm > storeSettings.flat_fee_start_km && distanceKm <= storeSettings.flat_fee_end_km) {
                deliveryFee = storeSettings.flat_fee_amount;
            } else {
                deliveryFee = storeSettings.base_delivery_fee + Math.floor(distanceKm * storeSettings.per_km_fee);
            }
        }
        deliveryMessage = `ส่งฟรี ${storeSettings.free_delivery_km} กม. | เหมา ${storeSettings.flat_fee_start_km}-${storeSettings.flat_fee_end_km} กม. ${storeSettings.flat_fee_amount}บ.`;
    }

    const pointsAvailable = profile?.points || 0;
    const pointsDiscount = usePoints ? Math.floor(pointsAvailable * 0.1) : 0;
    const finalTotal = Math.max(0, total + deliveryFee - pointsDiscount);

    const handleOrder = async () => {
        if (!user) {
            setShowLogin(true);
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
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const orderItemsInsert = items.map(item => ({
                order_id: order.id,
                menu_item_id: uuidRegex.test(item.id) ? item.id : null,
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

            // 3. Auto-save/update pin to addresses table
            if (mode === 'delivery' && mapCoords && addressText.trim()) {
                const addrPayload = {
                    user_id: user.id,
                    label: addressText.trim(),
                    detail: pinLabel.trim(),
                    lat: mapCoords.lat,
                    lng: mapCoords.lng,
                    is_default: true,
                };
                if (savedAddressId) {
                    await supabase.from('addresses').update(addrPayload).eq('id', savedAddressId);
                } else {
                    // Unset other defaults first
                    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
                    await supabase.from('addresses').insert(addrPayload);
                }
            }

            clear();
            router.push('/orders');
        } catch (error: unknown) {
            console.error('Error submitting order', error);
            const e = error as { message?: string; details?: string };
            const errorMsg = e?.message || e?.details || JSON.stringify(error) || 'Unknown error';
            alert(`เกิดข้อผิดพลาดจากฐานข้อมูล:\n${errorMsg}`);
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

                    {mode === 'delivery' && deliveryMessage && (
                        <div style={{ background: '#F0F9FF', padding: '10px 14px', borderRadius: 12, marginBottom: 16, fontSize: 13, color: '#007AFF', textAlign: 'center' }}>
                            🚙 <b>เงื่อนไขค่าส่ง:</b> {deliveryMessage}
                        </div>
                    )}

                    {/* Address Input */}
                    {mode === 'delivery' && (
                        <div style={{ border: '1px solid #EDEDED', borderRadius: 14, padding: '14px 16px', marginBottom: 12, background: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>ที่อยู่จัดส่ง</p>
                                <button
                                    onClick={() => setShowMap(true)}
                                    style={{
                                        background: '#FFF3DC', color: '#F5A623', border: 'none', borderRadius: 12,
                                        padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 4
                                    }}
                                >
                                    📍 ปักหมุดบนแผนที่
                                </button>
                            </div>
                            <textarea
                                className="input-field"
                                value={addressText}
                                onChange={e => setAddressText(e.target.value)}
                                placeholder="พิมพ์ที่อยู่จัดส่งให้ชัดเจน หรือกดปักหมุดบนแผนที่..."
                                style={{ height: 60, resize: 'none', marginBottom: 8, background: '#F9F9F9', border: 'none', padding: '10px' }}
                            />
                            {/* Pin label input */}
                            <input
                                type="text"
                                value={pinLabel}
                                onChange={e => setPinLabel(e.target.value)}
                                placeholder="ชื่อหมุด (ไม่บังคับ) เช่น 'บ้าน', 'ที่ทำงาน', 'บ้านแม่'"
                                style={{
                                    width: '100%', padding: '8px 10px', border: '1px solid #EDEDED',
                                    borderRadius: 8, fontFamily: 'inherit', fontSize: 13, background: '#F9F9F9',
                                    marginBottom: mapCoords ? 8 : 0,
                                }}
                            />
                            {mapCoords && (
                                <div style={{ fontSize: 12, color: '#4A9B5E', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span>✓ พิกัด: {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}</span>
                                    <span>(ระยะทาง ~{distanceKm} กม.)</span>
                                </div>
                            )}
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
            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
            {showMap && (
                <MapPicker
                    initialLat={storeSettings?.store_lat}
                    initialLng={storeSettings?.store_lng}
                    storeLat={storeSettings?.store_lat}
                    storeLng={storeSettings?.store_lng}
                    onSelect={(loc) => {
                        setMapCoords({ lat: loc.lat, lng: loc.lng });
                        if (loc.address) setAddressText(loc.address);
                        setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                />
            )}
            {/* Reuse last address popup */}
            {showReusePopup && savedAddressSnap && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                    animation: 'fadeIn 0.2s',
                }}>
                    <div style={{
                        background: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 380,
                        animation: 'slideInUp 0.3s ease',
                    }}>
                        <div style={{ fontSize: 36, textAlign: 'center', marginBottom: 12 }}>📍</div>
                        <h3 style={{ margin: '0 0 6px', textAlign: 'center', fontSize: 17, fontWeight: 700 }}>
                            ใช้ที่อยู่ล่าสุดไหมครับ?
                        </h3>
                        <div style={{
                            background: '#F9F9F9', borderRadius: 12, padding: '12px 14px', marginBottom: 20,
                            border: '1px solid #EDEDED',
                        }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>📍 {savedAddressSnap.label}</p>
                            {savedAddressSnap.detail && (
                                <p style={{ margin: '4px 0 0', color: '#777', fontSize: 12 }}>{savedAddressSnap.detail}</p>
                            )}
                            {savedAddressSnap.lat && (
                                <p style={{ margin: '4px 0 0', color: '#4A9B5E', fontSize: 11 }}>
                                    ✓ มีพิกัดแผนที่บันทึกไว้
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button
                                onClick={() => setShowReusePopup(false)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: 14, border: '1.5px solid #EDEDED',
                                    background: 'white', fontFamily: 'inherit', fontSize: 14, cursor: 'pointer', color: '#555'
                                }}
                            >
                                เปลี่ยนที่อยู่
                            </button>
                            <button
                                onClick={() => applyReuseAddress(savedAddressSnap)}
                                style={{
                                    flex: 2, padding: '12px', borderRadius: 14, border: 'none',
                                    background: 'linear-gradient(135deg, #F5A623, #E09010)',
                                    color: 'white', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer'
                                }}
                            >
                                ✓ ใช้ที่อยู่นี้
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

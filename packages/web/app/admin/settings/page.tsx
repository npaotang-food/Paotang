'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import MapPicker from '@/components/MapPicker';

interface StoreSettings {
    id: number;
    store_lat: number;
    store_lng: number;
    free_delivery_km: number;
    flat_fee_start_km: number;
    flat_fee_end_km: number;
    flat_fee_amount: number;
    base_delivery_fee: number;
    per_km_fee: number;
}

export default function AdminSettingsPage() {
    const { user, isAdmin } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            const { data } = await supabase.from('store_settings').select('*').single();
            if (data) setSettings(data);
            setIsLoading(false);
        };
        fetchSettings();
    }, [user, supabase]);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        const { error } = await supabase.from('store_settings').update({
            store_lat: settings.store_lat,
            store_lng: settings.store_lng,
            free_delivery_km: settings.free_delivery_km,
            flat_fee_start_km: settings.flat_fee_start_km,
            flat_fee_end_km: settings.flat_fee_end_km,
            flat_fee_amount: settings.flat_fee_amount,
            base_delivery_fee: settings.base_delivery_fee,
            per_km_fee: settings.per_km_fee
        }).eq('id', settings.id);

        setIsSaving(false);
        if (error) {
            alert('บันทึกไม่สำเร็จ: ' + error.message);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    if (isLoading) return <div style={{ minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Prompt, sans-serif' }}>⏳ กำลังโหลด...</div>;

    if (!user || !isAdmin) {
        return (
            <div style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Prompt, sans-serif' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🚫</div>
                <h2 style={{ margin: '0 0 8px' }}>ไม่มีสิทธิ์เข้าถึง</h2>
                <button className="btn-primary" onClick={() => router.push('/')} style={{ maxWidth: 200, marginTop: 16 }}>กลับหน้าแรก</button>
            </div>
        );
    }

    if (!settings) return <div style={{ padding: 20 }}>ไม่พบข้อมูลการตั้งค่าร้านค้า (กรุณารัน SQL Migration ก่อน)</div>;

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#F8F8F8', fontFamily: 'Prompt, sans-serif' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)', padding: '20px 20px 16px', color: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => router.push('/admin')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>← กลับ</button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>⚙️ ตั้งค่าร้าน & ค่าจัดส่ง</h1>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 100 }}>

                {/* Store Location */}
                <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        📍 พิกัดร้านค้า (Store Location)
                    </h3>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 13, color: '#777', marginBottom: 4, display: 'block' }}>ละติจูด (Lat)</label>
                            <input type="number" className="input-field" value={settings.store_lat} onChange={e => setSettings({ ...settings, store_lat: parseFloat(e.target.value) })} style={{ margin: 0 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 13, color: '#777', marginBottom: 4, display: 'block' }}>ลองจิจูด (Lng)</label>
                            <input type="number" className="input-field" value={settings.store_lng} onChange={e => setSettings({ ...settings, store_lng: parseFloat(e.target.value) })} style={{ margin: 0 }} />
                        </div>
                    </div>
                    <button
                        onClick={() => setShowMap(true)}
                        style={{ width: '100%', border: '1px solid #007AFF', color: '#007AFF', background: '#F0F9FF', padding: 12, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                        ปักหมุดตำแหน่งร้านใหม่บนแผนที่
                    </button>
                </div>

                {/* Delivery Fee Rules */}
                <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        🛵 ค่าจัดส่งตามระยะทาง
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                            <label style={{ fontSize: 13, color: '#777', marginBottom: 4, display: 'block' }}>ส่งฟรีเมื่อระยะทาง น้อยกว่า (กม.)</label>
                            <input type="number" step="0.1" className="input-field" value={settings.free_delivery_km} onChange={e => setSettings({ ...settings, free_delivery_km: parseFloat(e.target.value) })} style={{ margin: 0 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, color: '#777', marginBottom: 4, display: 'block' }}>ค่าส่งปกติเริ่มต้น (บาท: +กม.ละ)</label>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <input type="number" className="input-field" value={settings.base_delivery_fee} onChange={e => setSettings({ ...settings, base_delivery_fee: parseInt(e.target.value) })} style={{ margin: 0, width: '50%' }} />
                                <input type="number" className="input-field" value={settings.per_km_fee} onChange={e => setSettings({ ...settings, per_km_fee: parseInt(e.target.value) })} style={{ margin: 0, width: '50%' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: 12, background: '#FFF8E1', borderRadius: 12, border: '1px solid #FFE082' }}>
                        <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>เหมาจ่ายเฉพาะโซน (Flat Fee)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#777' }}>เริ่มตั้งแต่ กม.</label>
                                <input type="number" step="0.1" className="input-field" value={settings.flat_fee_start_km} onChange={e => setSettings({ ...settings, flat_fee_start_km: parseFloat(e.target.value) })} style={{ margin: 0, padding: 8 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#777' }}>ถึง กม.</label>
                                <input type="number" step="0.1" className="input-field" value={settings.flat_fee_end_km} onChange={e => setSettings({ ...settings, flat_fee_end_km: parseFloat(e.target.value) })} style={{ margin: 0, padding: 8 }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#777' }}>ราคาเหมา (บ.)</label>
                                <input type="number" className="input-field" value={settings.flat_fee_amount} onChange={e => setSettings({ ...settings, flat_fee_amount: parseInt(e.target.value) })} style={{ margin: 0, padding: 8 }} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Save Action */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
                borderTop: '1px solid #F0F0F0', padding: '16px', zIndex: 100, display: 'flex', gap: 12, justifyContent: 'center'
            }}>
                <div style={{ maxWidth: 600, width: '100%', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ flex: 1, background: saved ? '#34C759' : undefined }}
                    >
                        {isSaving ? '⏳ กำลังบันทึก...' : saved ? '✓ บันทึกสำเร็จ' : '💾 บันทึกการตั้งค่า'}
                    </button>
                </div>
            </div>

            {showMap && (
                <MapPicker
                    initialLat={settings.store_lat}
                    initialLng={settings.store_lng}
                    onSelect={(loc) => {
                        setSettings({ ...settings, store_lat: loc.lat, store_lng: loc.lng });
                        setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>
    );
}

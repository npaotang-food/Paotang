'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MapPicker from '@/components/MapPicker';

export default function ProfileAddressPage() {
    const router = useRouter();
    const [addressText, setAddressText] = useState('');
    const [detailText, setDetailText] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [mapCoords, setMapCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!addressText.trim()) {
            alert('กรุณากรอกหรือปักหมุดที่อยู่ก่อนบันทึก');
            return;
        }
        setIsSaving(true);
        try {
            // Note: in a real app, you'd save to Supabase public.addresses here.
            // For now we just mock success and go back since the user wants the UI.
            await new Promise(r => setTimeout(r, 600));
            router.back();
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="page-content" style={{ background: '#F5F5F5', minHeight: '100vh', padding: '0 0 80px' }}>
            {/* Header */}
            <div style={{
                background: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
                position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #F0F0F0'
            }}>
                <button onClick={() => router.back()} style={{
                    background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 0, display: 'flex'
                }}>‹</button>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>ที่อยู่การจัดส่ง</h1>
            </div>

            <div style={{ padding: '16px' }}>
                <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <label style={{ fontWeight: 600, fontSize: 14 }}>รายละเอียดที่อยู่</label>
                        <button
                            onClick={() => setShowMap(true)}
                            style={{
                                background: '#FFF3DC', color: '#F5A623', border: 'none', borderRadius: 12,
                                padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >
                            📍 ปักหมุดบนแผนที่
                        </button>
                    </div>

                    <textarea
                        value={addressText}
                        onChange={e => setAddressText(e.target.value)}
                        placeholder="บ้านเลขที่, ถนน, ซอย หรือกดปักหมุดเพื่อดึงข้อมูลอัตโนมัติ..."
                        style={{
                            width: '100%', height: 80, padding: 12, border: '1px solid #E5E5E5', borderRadius: 12,
                            resize: 'none', fontFamily: 'inherit', fontSize: 14, marginBottom: 8, background: '#F9F9F9'
                        }}
                    />

                    {mapCoords && (
                        <div style={{ fontSize: 12, color: '#4A9B5E', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>✓ พิกัด: {mapCoords.lat.toFixed(4)}, {mapCoords.lng.toFixed(4)}</span>
                        </div>
                    )}

                    <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>จุดสังเกต (ไม่บังคับ)</label>
                    <input
                        type="text"
                        value={detailText}
                        onChange={e => setDetailText(e.target.value)}
                        placeholder="เช่น บ้านรั้วสีเขียว, ตรงข้ามเซเว่น"
                        style={{
                            width: '100%', padding: 12, border: '1px solid #E5E5E5', borderRadius: 12,
                            fontFamily: 'inherit', fontSize: 14, background: '#F9F9F9'
                        }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div style={{
                position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: '100%', maxWidth: 430, background: 'white',
                borderTop: '1px solid #F0F0F0', padding: '16px 20px 28px'
            }}>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        width: '100%', padding: '16px', background: isSaving ? '#CCC' : '#F5A623',
                        color: 'white', borderRadius: '24px', fontWeight: 700, fontSize: 16,
                        border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
                </button>
            </div>

            {showMap && (
                <MapPicker
                    initialLat={mapCoords?.lat}
                    initialLng={mapCoords?.lng}
                    onSelect={(loc) => {
                        setMapCoords({ lat: loc.lat, lng: loc.lng });
                        if (loc.address) setAddressText(loc.address);
                        setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                />
            )}
        </main>
    );
}

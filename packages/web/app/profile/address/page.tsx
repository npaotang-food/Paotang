'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MapPicker from '@/components/MapPicker';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function ProfileAddressPage() {
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClient();

    const [addressText, setAddressText] = useState('');
    const [detailText, setDetailText] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [savedId, setSavedId] = useState<string | null>(null); // existing row id for update
    const [toast, setToast] = useState<string | null>(null);

    // Load existing default address on mount
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const { data } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_default', true)
                .single();
            if (data) {
                setSavedId(data.id);
                setAddressText(data.label || '');
                setDetailText(data.detail || '');
                if (data.lat && data.lng) setMapCoords({ lat: data.lat, lng: data.lng });
            }
        };
        load();
    }, [user, supabase]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSave = async () => {
        if (!addressText.trim()) {
            alert('กรุณากรอกหรือปักหมุดที่อยู่ก่อนบันทึก');
            return;
        }
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อน');
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                user_id: user.id,
                label: addressText.trim(),
                detail: detailText.trim(),
                lat: mapCoords?.lat ?? null,
                lng: mapCoords?.lng ?? null,
                is_default: true,
            };

            if (savedId) {
                // Update existing row
                const { error } = await supabase
                    .from('addresses')
                    .update(payload)
                    .eq('id', savedId);
                if (error) throw error;
            } else {
                // Insert new row (set all others to not-default first)
                await supabase
                    .from('addresses')
                    .update({ is_default: false })
                    .eq('user_id', user.id);

                const { data, error } = await supabase
                    .from('addresses')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                if (data) setSavedId(data.id);
            }

            showToast('✓ บันทึกที่อยู่เรียบร้อยแล้ว!');
            setTimeout(() => router.back(), 1200);
        } catch (error) {
            console.error('Save address error:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="page-content" style={{ background: '#F5F5F5', minHeight: '100vh', padding: '0 0 100px' }}>
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

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)',
                    background: '#1B5E20', color: 'white', padding: '10px 20px', borderRadius: 20,
                    fontWeight: 600, fontSize: 14, zIndex: 9999, whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}>
                    {toast}
                </div>
            )}

            <div style={{ padding: '16px' }}>
                {savedId && (
                    <div style={{ marginBottom: 12, padding: '8px 14px', background: '#E8F5E9', borderRadius: 10, fontSize: 13, color: '#2E7D32', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✓ โหลดที่อยู่ที่บันทึกไว้แล้ว
                    </div>
                )}

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
                            <span>📍 พิกัด: {mapCoords.lat.toFixed(5)}, {mapCoords.lng.toFixed(5)}</span>
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
                width: '100%', maxWidth: 680, background: 'white',
                borderTop: '1px solid #F0F0F0', padding: '16px 20px 28px'
            }}>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        width: '100%', padding: '16px',
                        background: isSaving ? '#CCC' : 'linear-gradient(135deg, #F5A623, #E09010)',
                        color: 'white', borderRadius: '24px', fontWeight: 700, fontSize: 16,
                        border: 'none', cursor: isSaving ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'opacity 0.2s',
                    }}
                >
                    {isSaving ? '⏳ กำลังบันทึก...' : '💾 บันทึกที่อยู่'}
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

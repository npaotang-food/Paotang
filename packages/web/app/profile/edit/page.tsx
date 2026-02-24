'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import BottomNav from '@/components/BottomNav';

export default function ProfileEditPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [nickname, setNickname] = useState('');
    const [phone, setPhone] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    // Pre-fill from profile
    useEffect(() => {
        if (profile) {
            setNickname(profile.name || '');
            setPhone((profile as { phone?: string }).phone || '');
        }
    }, [profile]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleSave = async () => {
        if (!user) return;
        if (!nickname.trim()) {
            showToast('⚠️ กรุณาระบุชื่อเล่น');
            return;
        }
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: nickname.trim(),
                    phone: phone.trim() || null,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;
            showToast('✓ บันทึกข้อมูลเรียบร้อยแล้ว!');
            setTimeout(() => router.back(), 1200);
        } catch (err) {
            console.error(err);
            showToast('⚠️ เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
        } finally {
            setIsSaving(false);
        }
    };

    // Derive username from email
    const username = user?.email?.replace('@paotang.app', '') ?? '';

    if (!user) {
        return (
            <>
                <main className="page-content">
                    <div className="empty-state" style={{ minHeight: '70vh' }}>
                        <span className="empty-state-icon">👤</span>
                        <p className="empty-state-title">กรุณาเข้าสู่ระบบก่อน</p>
                        <button className="btn-primary" onClick={() => router.push('/')} style={{ maxWidth: 200 }}>
                            กลับหน้าแรก
                        </button>
                    </div>
                </main>
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 100px', minHeight: '100vh' }}>
                {/* Header */}
                <div style={{
                    background: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: 12,
                    position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #F0F0F0'
                }}>
                    <button onClick={() => router.back()} style={{
                        background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', padding: 0
                    }}>‹</button>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>แก้ไขโปรไฟล์</h1>
                </div>

                {/* Toast */}
                {toast && (
                    <div style={{
                        position: 'fixed', top: 64, left: '50%', transform: 'translateX(-50%)',
                        background: toast.startsWith('⚠️') ? '#B71C1C' : '#1B5E20',
                        color: 'white', padding: '10px 20px', borderRadius: 20,
                        fontWeight: 600, fontSize: 14, zIndex: 9999, whiteSpace: 'nowrap',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    }}>
                        {toast}
                    </div>
                )}

                {/* Avatar */}
                <div style={{
                    background: 'linear-gradient(180deg, #FFF3DC, #FFFBF0)',
                    padding: '32px 20px 24px', textAlign: 'center'
                }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F5A623, #E09010)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: 700, color: 'white',
                        margin: '0 auto 8px',
                        boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
                    }}>
                        {nickname ? nickname.slice(0, 1).toUpperCase() : '?'}
                    </div>
                    <p style={{ margin: 0, color: '#999', fontSize: 13 }}>@{username}</p>
                </div>

                {/* Form */}
                <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Username (read-only) */}
                    <div style={{ background: 'white', borderRadius: 14, padding: '16px' }}>
                        <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 6 }}>
                            👤 Username (เปลี่ยนไม่ได้)
                        </label>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#555' }}>@{username}</p>
                    </div>

                    {/* Nickname */}
                    <div style={{ background: 'white', borderRadius: 14, padding: '16px' }}>
                        <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 8 }}>
                            😊 ชื่อเล่น *
                        </label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            placeholder="เช่น บีม, มิ้น, แบงค์"
                            style={{
                                width: '100%', padding: '10px 12px',
                                border: '1.5px solid #EBEBEB', borderRadius: 10,
                                fontFamily: 'Prompt, sans-serif', fontSize: 15,
                                outline: 'none', background: '#FAFAFA',
                            }}
                        />
                    </div>

                    {/* Phone */}
                    <div style={{ background: 'white', borderRadius: 14, padding: '16px' }}>
                        <label style={{ fontSize: 12, color: '#999', display: 'block', marginBottom: 8 }}>
                            📞 เบอร์โทรศัพท์ (ไม่บังคับ)
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="0812345678"
                            style={{
                                width: '100%', padding: '10px 12px',
                                border: '1.5px solid #EBEBEB', borderRadius: 10,
                                fontFamily: 'Prompt, sans-serif', fontSize: 15,
                                outline: 'none', background: '#FAFAFA',
                            }}
                        />
                    </div>
                </div>
            </main>

            {/* Save button */}
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
                        color: 'white', borderRadius: 24, border: 'none',
                        fontFamily: 'Prompt, sans-serif', fontWeight: 700, fontSize: 16,
                        cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isSaving ? '⏳ กำลังบันทึก...' : '💾 บันทึกโปรไฟล์'}
                </button>
            </div>

            <BottomNav />
        </>
    );
}

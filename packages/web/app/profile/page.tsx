'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import { useRouter } from 'next/navigation';


export default function ProfilePage() {
    const { user, profile, isLoggedIn, logout } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const router = useRouter();
    const pointsToNext = 5000 - (profile?.points ?? 1516);
    const pts = profile?.points ?? 1516;

    if (!isLoggedIn) {
        return (
            <>
                <main className="page-content">
                    <div className="empty-state" style={{ minHeight: '70vh' }}>
                        <span className="empty-state-icon">👤</span>
                        <p className="empty-state-title">เข้าสู่ระบบก่อนนะครับ</p>
                        <p className="empty-state-subtitle">เพื่อดูข้อมูลโปรไฟล์และคะแนนสะสม</p>
                        <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ maxWidth: 260 }}>
                            เข้าสู่ระบบ / สมัครสมาชิก
                        </button>
                    </div>
                </main>
                {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
                <BottomNav />
            </>
        );
    }

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 80px' }}>
                {/* Avatar */}
                <div style={{
                    background: 'linear-gradient(180deg, #FFF3DC 0%, #FFFBF0 100%)',
                    padding: '40px 20px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <div style={{
                            width: 80, height: 80,
                            background: 'linear-gradient(135deg, #F5A623, #E09010)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 28, fontWeight: 700, color: 'white',
                            margin: '0 auto',
                            boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
                        }}>
                            {profile?.initials ?? '??'}
                        </div>
                        <div style={{
                            position: 'absolute', bottom: 0, right: 0,
                            background: '#F5A623', borderRadius: '50%', width: 26, height: 26,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 14, border: '2px solid white',
                        }}>📷</div>
                    </div>
                    <h2 style={{ margin: '12px 0 4px', fontSize: 20, fontWeight: 700 }}>{profile?.name ?? ''}</h2>
                    <p style={{ margin: 0, color: '#999', fontSize: 13 }}>{profile?.email ?? user?.email ?? ''}</p>
                </div>

                {/* Gold Card */}
                <div style={{ padding: '0 16px', marginTop: -16 }}>
                    <div className="gold-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span className="badge">👑 GOLD</span>
                        </div>
                        <p style={{ margin: '0 0 4px', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                            {pts.toLocaleString()} <span style={{ fontSize: 16, fontWeight: 400 }}>คะแนน</span>
                        </p>
                        <p style={{ margin: '0 0 12px', fontSize: 12, opacity: 0.85 }}>แลกส่วนลดได้ ฿{(pts * 0.1).toFixed(2)}</p>

                        {/* Progress bar */}
                        <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 4, height: 6, marginBottom: 6 }}>
                            <div style={{
                                background: 'white', borderRadius: 4, height: 6,
                                width: `${Math.min((pts / 5000) * 100, 100)}%`,
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.85 }}>
                            <span>Gold</span>
                            <span>อีก {pointsToNext} เพื่อเป็น Platinum</span>
                        </div>

                        <button style={{
                            position: 'absolute', right: 20, top: 20,
                            background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.5)',
                            borderRadius: 20, padding: '6px 16px', color: 'white',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}>แลกเลย</button>

                        <div style={{
                            position: 'absolute', right: 70, bottom: 20,
                            fontSize: 40, opacity: 0.15, transform: 'rotate(-10deg)',
                        }}>🐾</div>
                    </div>
                </div>

                {/* Menu items */}
                <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                        { icon: '👥', label: 'แก้ไขโปรไฟล์', sub: '', href: '/profile/edit' },
                        { icon: '📍', label: 'ที่อยู่การจัดส่ง', sub: 'บ้านพี่ - หลังสีเขียว', href: '/profile/address' },
                        { icon: '📋', label: 'ประวัติการสั่งซื้อ', sub: '', href: '/orders' },
                        { icon: '💳', label: 'วิธีการชำระเงิน', sub: '', href: '/profile/payments' },
                    ].map((item, i) => (
                        <div key={i} onClick={() => router.push(item.href)} style={{
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '16px 0',
                            borderBottom: i < 3 ? '1px solid #F5F5F5' : 'none',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                        }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: 12,
                                background: '#FFF3DC',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 20, flexShrink: 0,
                            }}>
                                {item.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#333' }}>{item.label}</p>
                                {item.sub && <p style={{ margin: '2px 0 0', color: '#999', fontSize: 13 }}>{item.sub}</p>}
                            </div>
                            <span style={{ color: '#CCC', fontSize: 18 }}>›</span>
                        </div>
                    ))}
                </div>

                {/* Logout */}
                <div style={{ padding: '20px 16px 0' }}>
                    <button
                        onClick={logout}
                        style={{
                            width: '100%', padding: '14px', border: '1.5px solid #EDEDED',
                            borderRadius: 12, background: 'white', color: '#FF3B30',
                            fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </main>
            <BottomNav />
        </>
    );
}

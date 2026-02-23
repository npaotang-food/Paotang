'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import Image from 'next/image';

const FRUIT_MENU = [
    { id: '1', name: 'ส้มสายน้ำผึ้ง', desc: 'หวานฉ่ำ ไม่มีเม็ด เต็มกล่อง', price: 45, emoji: '🍊', image: '/menu/som-sainumpeung.jpg' },
    { id: '5', name: 'แตงโม Box', desc: 'ตัดเป็นชิ้น หวานฉ่ำ สีแดงสด', price: 45, emoji: '🍉', image: '/menu/tangmo-box.jpg' },
];

export default function FavoritesPage() {
    const { isLoggedIn } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [favorites, setFavorites] = useState(FRUIT_MENU);
    const [selectedMenu, setSelectedMenu] = useState<typeof FRUIT_MENU[0] | null>(null);

    const removeFav = (id: string) => setFavorites(f => f.filter(m => m.id !== id));

    if (!isLoggedIn) {
        return (
            <>
                <main className="page-content" style={{ padding: '0 0 80px' }}>
                    <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0' }}>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>รายการที่ชอบ ❤️</h1>
                    </div>
                    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                        <div style={{ fontSize: 70, marginBottom: 16 }}>❤️</div>
                        <h2 style={{ margin: '0 0 8px', color: '#2D2D2D', fontSize: 18 }}>เข้าสู่ระบบก่อนนะ!</h2>
                        <p style={{ color: '#999', marginBottom: 24, fontSize: 14 }}>เพื่อบันทึกเมนูโปรดของคุณ</p>
                        <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ maxWidth: 240, margin: '0 auto' }}>
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
                <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #F0F0F0' }}>
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>รายการที่ชอบ ❤️</h1>
                    <p style={{ margin: '4px 0 0', color: '#999', fontSize: 13 }}>{favorites.length} รายการ</p>
                </div>

                <div style={{ padding: '16px' }}>
                    {favorites.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <div style={{ fontSize: 60, marginBottom: 12 }}>💔</div>
                            <p style={{ color: '#999', fontSize: 14 }}>ยังไม่มีรายการที่ชอบ</p>
                            <p style={{ color: '#BBB', fontSize: 12 }}>กดไอคอน ❤️ ที่เมนูที่ชอบ</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {favorites.map(item => (
                                <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer' }} onClick={() => setSelectedMenu(item)}>
                                    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
                                        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="72px" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                        <p style={{ margin: '4px 0', color: '#999', fontSize: 12 }}>{item.desc}</p>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#FF8C42', fontSize: 14 }}>฿{item.price}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); removeFav(item.id); }}
                                            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                                        >❤️</button>
                                        <button
                                            className="add-btn"
                                            style={{ background: 'linear-gradient(135deg, #FF8C42, #F5A623)' }}
                                            onClick={e => { e.stopPropagation(); setSelectedMenu(item); }}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {selectedMenu && (
                <div className="modal-overlay" onClick={() => setSelectedMenu(null)}>
                    <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: 24 }}>
                        <div style={{ position: 'relative', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                            <Image src={selectedMenu.image} alt={selectedMenu.name} fill style={{ objectFit: 'cover' }} sizes="430px" />
                        </div>
                        <h2 style={{ margin: '0 0 8px' }}>{selectedMenu.name}</h2>
                        <p style={{ color: '#999', fontSize: 14 }}>{selectedMenu.desc}</p>
                        <p style={{ fontWeight: 800, fontSize: 20, color: '#FF8C42', margin: '12px 0 16px' }}>฿{selectedMenu.price}</p>
                        <button className="btn-primary">เพิ่มในตะกร้า</button>
                    </div>
                </div>
            )}
            <BottomNav />
        </>
    );
}

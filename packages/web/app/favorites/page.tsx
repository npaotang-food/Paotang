'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import MenuDetailModal from '@/components/MenuDetailModal';

const MENU_ITEMS = [
    { id: '2', name: 'สตอเบอร์รีลาเต้', desc: 'นมสตอเบอร์รีสดชื่น แยกชั้นสวยงาม เติมพลังวันใหม่', price: 35, emoji: '🍓' },
    { id: '6', name: 'โฮจิฉะลาเต้', desc: 'ชาโฮจิฉะคั่วหอม ผสมนมอุ่นๆ กลมกล่อม', price: 70, emoji: '🌾' },
];

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState(MENU_ITEMS);
    const [selectedMenu, setSelectedMenu] = useState<typeof MENU_ITEMS[0] | null>(null);

    const removeFav = (id: string) => setFavorites(f => f.filter(m => m.id !== id));

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 80px' }}>
                <div style={{
                    background: 'white', padding: '20px 16px 16px',
                    borderBottom: '1px solid #F0F0F0',
                }}>
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
                                <div key={item.id} className="menu-card" onClick={() => setSelectedMenu(item)}>
                                    <div className="menu-card-img">{item.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                        <p style={{ margin: '4px 0', color: '#999', fontSize: 12 }}>{item.desc}</p>
                                        <p style={{ margin: 0, fontWeight: 700, color: '#F5A623', fontSize: 14 }}>฿{item.price}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); removeFav(item.id); }}
                                            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                                        >❤️</button>
                                        <button
                                            className="add-btn"
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
                <MenuDetailModal item={selectedMenu} onClose={() => setSelectedMenu(null)} />
            )}
            <BottomNav />
        </>
    );
}

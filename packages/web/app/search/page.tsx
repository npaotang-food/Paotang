'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BottomNav from '@/components/BottomNav';
import MenuDetailModal from '@/components/MenuDetailModal';

const MENU_ITEMS = [
    { id: '1', name: 'ส้มสายน้ำผึ้ง', desc: 'หวานฉ่ำ ไม่มีเม็ด เต็มกล่อง', price: 45, image: '/menu/som-sainumpeung.jpg', emoji: '🍊', category: 'orange' },
    { id: '2', name: 'ส้มโชกุน', desc: 'หวานอมเปรี้ยวนิดๆ ฉ่ำมาก', price: 45, image: '/menu/som-chokun.jpg', emoji: '🍊', category: 'orange' },
    { id: '3', name: 'สับปะรดห้วยมุ่น', desc: 'หวานมาก ไม่ฝาด เนื้อกรอบ', price: 45, image: '/menu/sapparod-huaymun.jpg', emoji: '🍍', category: 'pineapple' },
    { id: '4', name: 'สับปะรดภูเก็ต', desc: 'หวานหอม เนื้อเหลืองทอง', price: 45, image: '/menu/sapparod-phuket.jpg', emoji: '🍍', category: 'pineapple' },
    { id: '5', name: 'แตงโม Box', desc: 'ตัดเป็นชิ้น หวานฉ่ำ สีแดงสด', price: 45, image: '/menu/tangmo-box.jpg', emoji: '🍉', category: 'watermelon' },
    { id: '6', name: 'แตงโม Ball', desc: 'ตักเป็นลูกบอลน่ารัก พรีเมียม', price: 45, image: '/menu/tangmo-ball.jpg', emoji: '🍉', category: 'watermelon' },
    { id: '7', name: 'แอปเปิ้ลฟูจิ', desc: 'นำเข้าญี่ปุ่น หวานกรอบ', price: 45, image: '/menu/apple-fuji.jpg', emoji: '🍎', category: 'apple' },
    { id: '8', name: 'มะละกอสุก', desc: 'เนื้อสีส้มสวย หวานธรรมชาติ', price: 45, image: '/menu/malako.jpg', emoji: '🍈', category: 'other' },
    { id: '9', name: 'ลำไยควั่นเมล็ด', desc: 'สดหวานหอม ควั่นเมล็ดแล้ว', price: 45, image: '/menu/lamyai.jpg', emoji: '🍈', category: 'other' },
];

type MenuItem = typeof MENU_ITEMS[0];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const results = query.trim().length > 0
        ? MENU_ITEMS.filter(m =>
            m.name.includes(query) ||
            m.desc.includes(query) ||
            m.emoji.includes(query)
        )
        : [];

    return (
        <>
            <main className="page-content" style={{ padding: '0 0 80px', minHeight: '100vh' }}>
                {/* Search header */}
                <div style={{
                    position: 'sticky', top: 0, zIndex: 50,
                    background: 'white', borderBottom: '1px solid #F0F0F0',
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    <button
                        onClick={() => router.back()}
                        style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 0, flexShrink: 0 }}
                    >‹</button>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
                        <input
                            ref={inputRef}
                            type="search"
                            placeholder="ค้นหาเมนูผลไม้..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 12px 10px 38px',
                                border: '1.5px solid #EBEBEB', borderRadius: 14,
                                fontFamily: 'Prompt, sans-serif', fontSize: 15, background: '#F9F9F9',
                                outline: 'none',
                            }}
                        />
                        {query && (
                            <button onClick={() => setQuery('')} style={{
                                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                background: '#BDBDBD', border: 'none', borderRadius: '50%',
                                width: 18, height: 18, fontSize: 11, color: 'white', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>✕</button>
                        )}
                    </div>
                </div>

                <div style={{ padding: '16px' }}>
                    {/* Empty / idle state */}
                    {query.trim().length === 0 && (
                        <div className="empty-state" style={{ paddingTop: 48 }}>
                            <span className="empty-state-icon">🔍</span>
                            <p className="empty-state-title">ค้นหาเมนูที่ชอบ</p>
                            <p className="empty-state-subtitle">ลองพิมพ์ชื่อผลไม้ เช่น ส้ม, แตงโม, สับปะรด</p>
                        </div>
                    )}

                    {/* No results */}
                    {query.trim().length > 0 && results.length === 0 && (
                        <div className="empty-state" style={{ paddingTop: 48 }}>
                            <span className="empty-state-icon">😕</span>
                            <p className="empty-state-title">ไม่พบเมนู "{query}"</p>
                            <p className="empty-state-subtitle">ลองค้นหาด้วยคำอื่น</p>
                        </div>
                    )}

                    {/* Results */}
                    {results.length > 0 && (
                        <>
                            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#999' }}>
                                พบ {results.length} รายการ
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {results.map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedMenu(item)}
                                        className="card"
                                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, cursor: 'pointer' }}
                                    >
                                        <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: '#FFF3DC' }}>
                                            <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{item.emoji} {item.name}</p>
                                            <p style={{ margin: '2px 0', color: '#999', fontSize: 12 }}>{item.desc}</p>
                                            <p style={{ margin: 0, fontWeight: 700, color: '#FF8C42', fontSize: 14 }}>฿{item.price}</p>
                                        </div>
                                        <span style={{ color: '#BDBDBD', fontSize: 18 }}>›</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>

            {selectedMenu && <MenuDetailModal item={selectedMenu} onClose={() => setSelectedMenu(null)} />}
            <BottomNav />
        </>
    );
}

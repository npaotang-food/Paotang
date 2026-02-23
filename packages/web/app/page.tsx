'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import LoginModal from '@/components/LoginModal';
import MenuDetailModal from '@/components/MenuDetailModal';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

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

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด', emoji: '🧺' },
  { id: 'orange', label: 'ส้ม', emoji: '🍊' },
  { id: 'pineapple', label: 'สับปะรด', emoji: '🍍' },
  { id: 'watermelon', label: 'แตงโม', emoji: '🍉' },
  { id: 'apple', label: 'แอปเปิ้ล', emoji: '🍎' },
  { id: 'other', label: 'อื่นๆ', emoji: '🍈' },
];

const BANNERS = [
  { title: 'ผลไม้ปอก สดใหม่ทุกวัน', sub: 'ส่งถึงหน้าบ้าน ฟรีค่าส่ง', emoji: '🍊', bg: 'linear-gradient(135deg, #FF8C42, #FF6B35)' },
  { title: 'คัดเกรด A ทุกชิ้น', sub: 'หวานฉ่ำ สะอาด ปลอดภัย', emoji: '🍍', bg: 'linear-gradient(135deg, #F5D020, #F5A623)' },
  { title: 'สั่ง 3 กล่องขึ้นไป', sub: 'ลด 10% ทันที!', emoji: '🍉', bg: 'linear-gradient(135deg, #E84393, #D20069)' },
];

export default function HomePage() {
  const { isLoggedIn, profile } = useAuth();
  const { count } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBanner, setActiveBanner] = useState(0);
  const [favorites, setFavorites] = useState<string[]>(['1', '5']);
  const [selectedMenu, setSelectedMenu] = useState<typeof MENU_ITEMS[0] | null>(null);

  const filtered = activeCategory === 'all'
    ? MENU_ITEMS
    : MENU_ITEMS.filter(m => m.category === activeCategory);

  const toggleFav = (id: string) =>
    setFavorites(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  return (
    <>
      <main className="page-content" style={{ paddingBottom: 80 }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(160deg, #FF8C42 0%, #F5A623 100%)',
          padding: '48px 20px 24px',
          color: 'white',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 13, opacity: 0.85 }}>
                {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
                {isLoggedIn ? `สวัสดี, ${profile?.name?.split(' ')[0] ?? 'คุณ'} 👋` : 'เป๋าตังค์ 🧺'}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>ผลไม้ปอกสด ส่งถึงหน้าบ้าน</p>
            </div>
            <button
              onClick={() => !isLoggedIn && setShowLogin(true)}
              style={{
                background: 'rgba(255,255,255,0.25)', border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: 20, padding: '6px 14px', color: 'white',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {isLoggedIn ? `🪙 ${profile?.points ?? 0} แต้ม` : 'เข้าสู่ระบบ'}
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginTop: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              className="input-field"
              placeholder="ค้นหาผลไม้..."
              style={{ paddingLeft: 44, background: 'rgba(255,255,255,0.95)', marginBottom: 0 }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ overflowX: 'auto', padding: '16px 16px 8px', display: 'flex', gap: 10 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                flexShrink: 0,
                padding: '8px 16px', borderRadius: 20,
                border: activeCategory === cat.id ? 'none' : '1.5px solid #EDEDED',
                background: activeCategory === cat.id ? 'linear-gradient(135deg, #FF8C42, #F5A623)' : 'white',
                color: activeCategory === cat.id ? 'white' : '#555',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: activeCategory === cat.id ? '0 2px 12px rgba(245,166,35,0.35)' : 'none',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Banner Carousel */}
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            ...({ background: BANNERS[activeBanner].bg } as React.CSSProperties),
            borderRadius: 16, padding: '20px 24px',
            color: 'white', position: 'relative', overflow: 'hidden',
            minHeight: 100,
          }}>
            <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 800 }}>{BANNERS[activeBanner].emoji} {BANNERS[activeBanner].title}</p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }}>{BANNERS[activeBanner].sub}</p>
            <div style={{ position: 'absolute', right: 20, bottom: 10, fontSize: 50, opacity: 0.25 }}>
              {BANNERS[activeBanner].emoji}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveBanner(i)}
                style={{
                  width: activeBanner === i ? 20 : 6, height: 6,
                  borderRadius: 3, border: 'none',
                  background: activeBanner === i ? '#F5A623' : '#DDD',
                  cursor: 'pointer', transition: 'all 0.3s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              {activeCategory === 'all' ? 'เมนูทั้งหมด 🧺' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            <span style={{ color: '#999', fontSize: 12 }}>{filtered.length} รายการ</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingBottom: 12 }}>
            {filtered.map(item => (
              <div
                key={item.id}
                className="card"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setSelectedMenu(item)}
              >
                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '1', background: '#FFF3E0' }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 430px) 50vw, 200px"
                  />
                  {/* Fav button */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleFav(item.id); }}
                    style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(255,255,255,0.85)', border: 'none',
                      borderRadius: '50%', width: 30, height: 30,
                      fontSize: 15, cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}
                  >
                    {favorites.includes(item.id) ? '❤️' : '🤍'}
                  </button>
                </div>
                {/* Info */}
                <div style={{ padding: '10px 12px 12px' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 13 }}>{item.name}</p>
                  <p style={{ margin: '0 0 8px', color: '#999', fontSize: 11, lineHeight: 1.4 }}>{item.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#FF8C42', fontSize: 15 }}>฿{item.price}</span>
                    <button
                      className="add-btn"
                      onClick={e => { e.stopPropagation(); setSelectedMenu(item); }}
                      style={{ background: 'linear-gradient(135deg, #FF8C42, #F5A623)' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {selectedMenu && (
        <MenuDetailModal item={selectedMenu} onClose={() => setSelectedMenu(null)} />
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <BottomNav />
    </>
  );
}

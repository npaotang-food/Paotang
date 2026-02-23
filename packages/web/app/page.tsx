'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import LoginModal from '@/components/LoginModal';
import MenuDetailModal from '@/components/MenuDetailModal';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = [
  { id: 'all', name: 'เมนูแนะนำ', icon: '⭐' },
  { id: 'all2', name: 'เมนูทั้งหมด', icon: '☕' },
  { id: 'fav', name: 'เมนูที่ชอบ', icon: '❤️' },
  { id: 'tea', name: 'ชาใส', icon: '🍵' },
  { id: 'fruit', name: 'ชานมผลไม้', icon: '🍎' },
];

const MENU_ITEMS = [
  { id: '1', name: 'ชาไทยซีส', desc: 'ชาไทยรสเข้มข้นยอดฮิต เพิ่มความนัวด้วยชีสนุ่มๆ', price: 50, emoji: '🧋', isFav: false },
  { id: '2', name: 'สตอเบอร์รีลาเต้', desc: 'นมสตอเบอร์รีเปรี้ยวหวานสดชื่น แยกชั้นสวยงาม', price: 35, emoji: '🍓', isFav: true },
  { id: '3', name: 'ชาชีสลิ้นจี่', desc: 'ชาลิ้นจี่รสละมุน หอมกลิ่นผลไม้เมืองร้อน ท็อปด้วยชีสนุ่มๆ', price: 85, emoji: '🍵', isFav: false },
  {
    id: '4', name: 'พายบานอฟฟี่', desc: 'พายตกแต่งด้วยกล้วยหอม คาราเมลซอสและวิปครีม', price: 150, emoji: '🍰', isFav: false,
    options: { label: 'ขนาด (เลือก 1 ข้อ)', items: [{ id: 'o1', label: '1 ปอนด์', priceAddOn: 750 }, { id: 'o2', label: '2 ปอนด์', priceAddOn: 1650 }] }
  },
  { id: '5', name: 'มัทฉะลาเต้', desc: 'มัทฉะญี่ปุ่นแท้ ผสมนมสดเนื้อเนียน หอมกลิ่นชาเขียว', price: 75, emoji: '🍃', isFav: false },
  { id: '6', name: 'โฮจิฉะลาเต้', desc: 'ชาโฮจิฉะคั่วหอม ผสมนมอุ่นๆ กลมกล่อม ไม่ขมมาก', price: 70, emoji: '🌾', isFav: true },
];

const BANNERS = [
  { id: 1, bg: 'linear-gradient(135deg, #FFF3DC, #F5C480)', title: '1st Anniversary! ฉลองครบรอบ 1 ปี 🎉', emoji: '🧋🥤☕' },
  { id: 2, bg: 'linear-gradient(135deg, #E8F5E9, #A5D6A7)', title: 'เมนูใหม่มาแล้ว! ลองชิมได้เลย 🌟', emoji: '🍵🎋🌿' },
  { id: 3, bg: 'linear-gradient(135deg, #FFF8E1, #FFE082)', title: 'สะสมคะแนนแลกของรางวัล ✨', emoji: '⭐🎁💛' },
];

export default function HomePage() {
  const { user, isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedMenu, setSelectedMenu] = useState<typeof MENU_ITEMS[0] | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['2', '6']);

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <>
      {/* Header */}
      <header style={{ padding: '20px 20px 12px', background: 'white', borderBottom: '1px solid #F0F0F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 12, color: '#999', margin: 0 }}>สั่งชานมจาก</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#2D2D2D' }}>
                สวัสดีคุณ {isLoggedIn ? user?.name : 'Guest'} 👋
              </p>
              <span style={{ fontSize: 12, color: '#F5A623' }}>▼</span>
            </div>
          </div>
          <button
            onClick={() => !isLoggedIn ? setShowLogin(true) : null}
            style={{
              background: '#F5F5F5',
              border: 'none',
              borderRadius: 12,
              padding: '8px',
              fontSize: 20,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            🛒
          </button>
        </div>
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <input
            className="input-field"
            placeholder="ค้นหาเมนู หรือ ร้านอาหาร..."
            style={{ paddingLeft: 44 }}
          />
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
          <button style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #F5A623, #E09010)',
            border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 16, cursor: 'pointer',
          }}>
            ⚙️
          </button>
        </div>
      </header>

      <main style={{ padding: '20px 16px 0' }} className="page-content">
        {/* Categories */}
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>หมวดหมู่</h2>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              className={`category-icon ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <div className="category-icon-circle">{cat.icon}</div>
              <span style={{ fontSize: 11, textAlign: 'center', whiteSpace: 'nowrap' }}>{cat.name}</span>
            </div>
          ))}
        </div>

        {/* Carousel Banner */}
        <div style={{ marginTop: 20 }}>
          <div style={{
            background: BANNERS[activeBanner].bg,
            borderRadius: 20,
            padding: '24px 20px',
            minHeight: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.3s ease',
          }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: '#5D3A00', lineHeight: 1.4 }}>
                {BANNERS[activeBanner].title}
              </p>
            </div>
            <span style={{ fontSize: 36 }}>{BANNERS[activeBanner].emoji.split('')[0]}</span>
          </div>
          <div className="carousel-dots" style={{ marginTop: 10 }}>
            {BANNERS.map((_, i) => (
              <div
                key={i}
                className={`carousel-dot ${activeBanner === i ? 'active' : ''}`}
                onClick={() => setActiveBanner(i)}
              />
            ))}
          </div>
        </div>

        {/* Recommended menu */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
            เมนูแนะนำ <span style={{ color: '#999', fontWeight: 400, fontSize: 13 }}>({MENU_ITEMS.length} เมนู)</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {MENU_ITEMS.map(item => (
              <div key={item.id} className="menu-card" onClick={() => setSelectedMenu(item)}>
                <div className="menu-card-img">{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                  <p style={{ margin: '4px 0', color: '#999', fontSize: 12, lineHeight: 1.4 }}>
                    {item.desc.length > 42 ? item.desc.slice(0, 42) + '...' : item.desc}
                  </p>
                  <p style={{ margin: 0, fontWeight: 700, color: '#F5A623', fontSize: 14 }}>฿{item.price}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={(e) => toggleFav(item.id, e)}
                    style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                  >
                    {favorites.includes(item.id) ? '❤️' : '🤍'}
                  </button>
                  <button
                    className="add-btn"
                    onClick={(e) => { e.stopPropagation(); setSelectedMenu(item); }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Login modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Menu detail modal */}
      {selectedMenu && (
        <MenuDetailModal
          item={selectedMenu}
          onClose={() => setSelectedMenu(null)}
        />
      )}

      <BottomNav />
    </>
  );
}

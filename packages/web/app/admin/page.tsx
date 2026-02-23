'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';

const INITIAL_MENU = [
    { id: '1', name: 'ส้มสายน้ำผึ้ง', desc: 'หวานฉ่ำ ไม่มีเม็ด เต็มกล่อง', price: 45, image: '/menu/som-sainumpeung.jpg', emoji: '🍊', category: 'orange', isActive: true },
    { id: '2', name: 'ส้มโชกุน', desc: 'หวานอมเปรี้ยวนิดๆ ฉ่ำมาก', price: 45, image: '/menu/som-chokun.jpg', emoji: '🍊', category: 'orange', isActive: true },
    { id: '3', name: 'สับปะรดห้วยมุ่น', desc: 'หวานมาก ไม่ฝาด เนื้อกรอบ', price: 45, image: '/menu/sapparod-huaymun.jpg', emoji: '🍍', category: 'pineapple', isActive: true },
    { id: '4', name: 'สับปะรดภูเก็ต', desc: 'หวานหอม เนื้อเหลืองทอง', price: 45, image: '/menu/sapparod-phuket.jpg', emoji: '🍍', category: 'pineapple', isActive: true },
    { id: '5', name: 'แตงโม Box', desc: 'ตัดเป็นชิ้น หวานฉ่ำ สีแดงสด', price: 45, image: '/menu/tangmo-box.jpg', emoji: '🍉', category: 'watermelon', isActive: true },
    { id: '6', name: 'แตงโม Ball', desc: 'ตักเป็นลูกบอลน่ารัก พรีเมียม', price: 45, image: '/menu/tangmo-ball.jpg', emoji: '🍉', category: 'watermelon', isActive: true },
    { id: '7', name: 'แอปเปิ้ลฟูจิ', desc: 'นำเข้าญี่ปุ่น หวานกรอบ', price: 45, image: '/menu/apple-fuji.jpg', emoji: '🍎', category: 'apple', isActive: true },
    { id: '8', name: 'มะละกอสุก', desc: 'เนื้อสีส้มสวย หวานธรรมชาติ', price: 45, image: '/menu/malako.jpg', emoji: '🍈', category: 'other', isActive: true },
    { id: '9', name: 'ลำไยควั่นเมล็ด', desc: 'สดหวานหอม ควั่นเมล็ดแล้ว', price: 45, image: '/menu/lamyai.jpg', emoji: '🍈', category: 'other', isActive: true },
];

type MenuItem = typeof INITIAL_MENU[0];

export default function AdminPage() {
    const { isLoggedIn } = useAuth();
    const router = useRouter();
    const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [tab, setTab] = useState<'menu' | 'orders'>('menu');
    const [saved, setSaved] = useState(false);

    // Mock order data for admin view
    const ORDERS = [
        { id: 'ORD-001', customer: 'สมชาย ใจดี', items: 'ส้มสายน้ำผึ้ง x2, แตงโม Box x1', total: 135, status: 'delivering', time: '14:32' },
        { id: 'ORD-002', customer: 'สมหญิง รักผลไม้', items: 'สับปะรดห้วยมุ่น x1', total: 45, status: 'preparing', time: '14:28' },
        { id: 'ORD-003', customer: 'มานะ ดีใจ', items: 'ลำไยควั่นเมล็ด x3', total: 135, status: 'pending', time: '14:20' },
        { id: 'ORD-004', customer: 'วิชัย ชอบส้ม', items: 'ส้มโชกุน x2, แอปเปิ้ลฟูจิ x1', total: 135, status: 'done', time: '13:55' },
    ];

    const STATUS_MAP: Record<string, { label: string; color: string }> = {
        pending: { label: 'รอยืนยัน', color: '#FF9500' },
        preparing: { label: 'กำลังเตรียม', color: '#007AFF' },
        delivering: { label: 'กำลังส่ง', color: '#34C759' },
        done: { label: 'สำเร็จ', color: '#8E8E93' },
    };

    const handleSave = (item: MenuItem) => {
        setMenu(prev => prev.map(m => m.id === item.id ? item : m));
        setEditItem(null);
        setShowForm(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleToggle = (id: string) => {
        setMenu(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
    };

    const activeCount = menu.filter(m => m.isActive).length;

    return (
        <div style={{ minHeight: '100vh', background: '#F8F8F8', fontFamily: 'Itim, sans-serif' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)',
                padding: '20px 20px 16px',
                color: 'white',
                position: 'sticky', top: 0, zIndex: 50,
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={() => router.push('/')}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        ← กลับ
                    </button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🧺 Admin Dashboard</h1>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>เป๋าตังค์ — จัดการร้านค้า</p>
                    </div>
                    {saved && (
                        <span style={{
                            background: '#34C759', borderRadius: 20, padding: '4px 14px',
                            fontSize: 12, fontWeight: 600, color: 'white',
                        }}>✓ บันทึกแล้ว</span>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'เมนูทั้งหมด', value: menu.length, color: '#FF8C42', icon: '🍱' },
                        { label: 'เปิดขาย', value: activeCount, color: '#34C759', icon: '✅' },
                        { label: 'ออเดอร์วันนี้', value: ORDERS.length, color: '#007AFF', icon: '📋' },
                        { label: 'รายได้', value: `฿${ORDERS.reduce((s, o) => s + o.total, 0)}`, color: '#F5A623', icon: '💰' },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: 'white', borderRadius: 14, padding: '16px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center',
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#999' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {(['menu', 'orders'] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '10px 24px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
                            background: tab === t ? '#2D2D2D' : 'white',
                            color: tab === t ? 'white' : '#555',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            transition: 'all 0.2s',
                        }}>
                            {t === 'menu' ? '🍱 จัดการเมนู' : '📋 ออเดอร์'}
                        </button>
                    ))}
                </div>

                {/* Menu Tab */}
                {tab === 'menu' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {menu.map(item => (
                            <div key={item.id} style={{
                                background: 'white', borderRadius: 14, overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                opacity: item.isActive ? 1 : 0.6,
                                transition: 'opacity 0.2s',
                            }}>
                                {/* Image */}
                                <div style={{ position: 'relative', height: 160 }}>
                                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="300px" />
                                    {!item.isActive && (
                                        <div style={{
                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 700, fontSize: 16,
                                        }}>ปิดการขาย</div>
                                    )}
                                </div>
                                {/* Info */}
                                <div style={{ padding: '12px 14px 14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{item.name}</p>
                                            <p style={{ margin: '2px 0 8px', color: '#999', fontSize: 11 }}>{item.desc}</p>
                                        </div>
                                        <span style={{ fontWeight: 800, color: '#FF8C42', fontSize: 16, flexShrink: 0 }}>฿{item.price}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            onClick={() => { setEditItem({ ...item }); setShowForm(true); }}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: 8, border: '1.5px solid #EDEDED',
                                                background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                                            }}
                                        >
                                            ✏️ แก้ไข
                                        </button>
                                        <button
                                            onClick={() => handleToggle(item.id)}
                                            style={{
                                                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                                                background: item.isActive ? '#FFE8E8' : '#E8FFE8',
                                                color: item.isActive ? '#FF3B30' : '#34C759',
                                                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                                            }}
                                        >
                                            {item.isActive ? '🔴 ปิดขาย' : '🟢 เปิดขาย'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Orders Tab */}
                {tab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ORDERS.map(order => {
                            const st = STATUS_MAP[order.status];
                            return (
                                <div key={order.id} style={{
                                    background: 'white', borderRadius: 14, padding: '16px 20px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    display: 'flex', alignItems: 'center', gap: 16,
                                }}>
                                    <div style={{ minWidth: 80 }}>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{order.id}</p>
                                        <p style={{ margin: '2px 0 0', color: '#999', fontSize: 11 }}>🕐 {order.time}</p>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{order.customer}</p>
                                        <p style={{ margin: '2px 0 0', color: '#777', fontSize: 12 }}>{order.items}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 4px', fontWeight: 800, color: '#FF8C42', fontSize: 16 }}>฿{order.total}</p>
                                        <span style={{
                                            background: st.color + '20', color: st.color,
                                            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600,
                                        }}>{st.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showForm && editItem && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 200, padding: 20,
                }}>
                    <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440 }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>✏️ แก้ไข {editItem.name}</h2>
                        {[
                            { label: 'ชื่อเมนู', key: 'name', type: 'text' },
                            { label: 'รายละเอียด', key: 'desc', type: 'text' },
                            { label: 'ราคา (บาท)', key: 'price', type: 'number' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#555' }}>
                                    {f.label}
                                </label>
                                <input
                                    type={f.type}
                                    value={(editItem as Record<string, string | number | boolean>)[f.key] as string}
                                    onChange={e => setEditItem(prev => prev ? { ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value } : null)}
                                    style={{
                                        width: '100%', padding: '10px 14px',
                                        border: '1.5px solid #EDEDED', borderRadius: 10,
                                        fontFamily: 'inherit', fontSize: 14, outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button
                                onClick={() => { setShowForm(false); setEditItem(null); }}
                                style={{
                                    flex: 1, padding: 12, border: '1.5px solid #EDEDED', borderRadius: 10,
                                    background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
                                }}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => handleSave(editItem)}
                                style={{
                                    flex: 1, padding: 12, border: 'none', borderRadius: 10,
                                    background: 'linear-gradient(135deg, #FF8C42, #F5A623)',
                                    color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
                                }}
                            >
                                บันทึก ✓
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

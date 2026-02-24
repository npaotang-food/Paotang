'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface OrderItem { name: string; qty: number; emoji: string; price: number; options: string[] }
interface Order {
    id: string;
    total: number;
    status: string;
    created_at: string;
    user_id: string;
    order_items: OrderItem[];
}

const DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];

const MENU_EMOJIS: Record<string, string> = {
    'ส้มสายน้ำผึ้ง': '🍊', 'ส้มโชกุน': '🍊',
    'สับปะรดห้วยมุ่น': '🍍', 'สับปะรดภูเก็ต': '🍍',
    'แตงโม Box': '🍉', 'แตงโม Ball': '🍉',
    'แอปเปิ้ลฟูจิ': '🍎', 'มะละกอสุก': '🍈', 'ลำไยควั่นเมล็ด': '🍈',
};

export default function AdminDashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [orders, setOrders] = useState<Order[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase.from('orders')
                .select('id, total, status, created_at, user_id, order_items(name, qty, emoji, price, options)')
                .order('created_at', { ascending: false });
            setOrders((data as unknown as Order[]) || []);
            setFetching(false);
        };
        if (user) load();
    }, [user, supabase]);

    if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Prompt,sans-serif' }}>⏳ กำลังโหลด...</div>;
    if (!user || user.email !== 'admin@paotang.com') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Prompt,sans-serif' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🚫</div>
                <button className="btn-primary" onClick={() => router.push('/')} style={{ maxWidth: 200 }}>กลับหน้าแรก</button>
            </div>
        );
    }

    // ─── Derived stats ────────────────────────────────────────────
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
    const uniqueUsers = new Set(orders.map(o => o.user_id)).size;

    // Top menu items by count
    const menuCount: Record<string, number> = {};
    orders.forEach(o => {
        (o.order_items || []).forEach((item: OrderItem) => {
            menuCount[item.name] = (menuCount[item.name] || 0) + (item.qty || 1);
        });
    });
    const topMenus = Object.entries(menuCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxQty = topMenus[0]?.[1] || 1;

    // 7-day chart
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStr = d.toDateString();
        const dayTotal = orders.filter(o => new Date(o.created_at).toDateString() === dayStr).reduce((s, o) => s + (o.total || 0), 0);
        return { label: DAYS[d.getDay()], value: dayTotal };
    });
    const maxDay = Math.max(...last7.map(d => d.value), 1);

    return (
        <div style={{ minHeight: '100vh', background: '#F8F8F8', fontFamily: 'Prompt,sans-serif' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)', padding: '20px 20px 16px', color: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => router.push('/admin')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>← กลับ</button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>📊 Dashboard ยอดขาย</h1>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {[
                        { label: 'รายได้วันนี้', value: `฿${todayRevenue.toLocaleString()}`, icon: '💰', color: '#F5A623' },
                        { label: 'ออเดอร์วันนี้', value: todayOrders.length, icon: '📦', color: '#007AFF' },
                        { label: 'ลูกค้าทั้งหมด', value: uniqueUsers, icon: '👥', color: '#34C759' },
                    ].map(c => (
                        <div key={c.label} style={{ background: 'white', borderRadius: 16, padding: '18px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <div style={{ fontSize: 32, marginBottom: 6 }}>{c.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.value}</div>
                            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* 7-day Revenue Chart */}
                <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: 15 }}>📈 ยอดขาย 7 วันล่าสุด</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingBottom: 8 }}>
                        {last7.map((d, i) => {
                            const h = d.value > 0 ? Math.max((d.value / maxDay) * 100, 8) : 4;
                            const isToday = i === 6;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    {d.value > 0 && <span style={{ fontSize: 10, color: '#999' }}>฿{d.value}</span>}
                                    <div style={{
                                        width: '100%', height: `${h}px`, borderRadius: '6px 6px 0 0',
                                        background: isToday
                                            ? 'linear-gradient(180deg, #F5A623, #E09010)'
                                            : 'linear-gradient(180deg, #E0E0E0, #BDBDBD)',
                                        transition: 'height 0.8s ease',
                                    }} />
                                    <span style={{ fontSize: 10, color: isToday ? '#F5A623' : '#999', fontWeight: isToday ? 700 : 400 }}>{d.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top 5 Menus */}
                <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🏆 เมนูขายดี Top 5</h3>
                    {fetching ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>กำลังโหลด...</div>
                    ) : topMenus.length === 0 ? (
                        <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>ยังไม่มีข้อมูลการขาย</div>
                    ) : topMenus.map(([name, qty], i) => (
                        <div key={name} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}{' '}
                                    {MENU_EMOJIS[name] || '🍱'} {name}
                                </span>
                                <span style={{ fontSize: 12, color: '#F5A623', fontWeight: 700 }}>{qty} ชิ้น</span>
                            </div>
                            <div style={{ height: 8, background: '#F5F5F5', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: 4,
                                    background: i === 0 ? 'linear-gradient(90deg, #F5A623, #FF8C42)' : 'linear-gradient(90deg, #BDBDBD, #9E9E9E)',
                                    width: `${(qty / maxQty) * 100}%`,
                                    transition: 'width 1s ease',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* All-time stats */}
                <div style={{ background: 'linear-gradient(135deg, #F5A623, #E09010)', borderRadius: 16, padding: 20, color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                        {[
                            { label: 'รวมออเดอร์', value: orders.length },
                            { label: 'รายได้รวม', value: `฿${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}` },
                            { label: 'สำเร็จ', value: orders.filter(o => o.status === 'done').length },
                        ].map(s => (
                            <div key={s.label}>
                                <div style={{ fontSize: 24, fontWeight: 800 }}>{s.value}</div>
                                <div style={{ fontSize: 12, opacity: 0.85 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { uploadMenuImage, formatFileSize } from '@/utils/imageUtils';
import { useAuth } from '@/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'orange' | 'pineapple' | 'watermelon' | 'apple' | 'other';

type MenuItem = {
    id: string;
    name: string;
    desc: string;
    price: number;
    image: string;
    emoji: string;
    category: Category;
    isActive: boolean;
};

type OrderItem = { name: string; qty: number; emoji: string; options?: string[] };
type Order = {
    id: string;
    user_id: string;
    customer: string;
    delivery_address?: string;
    distance_km?: number;
    delivery_fee?: number;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'preparing' | 'delivering' | 'done' | 'cancelled';
    created_at: string;
    note?: string;
};

// ─── Static Data ──────────────────────────────────────────────────────────────

const INITIAL_MENU: MenuItem[] = [
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

const STATUS_MAP = {
    pending: { label: 'รอยืนยัน', color: '#FF9500', icon: '⏳' },
    preparing: { label: 'กำลังเตรียม', color: '#007AFF', icon: '👨‍🍳' },
    delivering: { label: 'กำลังส่ง', color: '#34C759', icon: '🚴' },
    done: { label: 'สำเร็จ', color: '#8E8E93', icon: '✓' },
    cancelled: { label: 'ยกเลิก', color: '#FF3B30', icon: '✕' },
} as const;

// ─── Empty add-form ────────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', desc: '', price: 45, emoji: '🍊', category: 'orange' as Category };

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const router = useRouter();
    const supabase = createClient();
    const { user, isLoading } = useAuth();

    const [tab, setTab] = useState<'menu' | 'orders'>('menu');
    const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Edit existing
    const [editItem, setEditItem] = useState<MenuItem | null>(null);
    const [showEdit, setShowEdit] = useState(false);

    // Add new menu
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState(EMPTY_FORM);
    const [addUploading, setAddUploading] = useState(false);
    const [addImageUrl, setAddImageUrl] = useState('');
    const [addImagePreview, setAddImagePreview] = useState('');
    const addFileRef = useRef<HTMLInputElement>(null);

    // Edit image upload
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [uploadOrigSize, setUploadOrigSize] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const editFileRef = useRef<HTMLInputElement>(null);

    const [saved, setSaved] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

    // ── Fetch orders from Supabase ──────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const { data } = await supabase
                .from('orders')
                .select(`
          id, user_id, total, status, created_at, delivery_address, delivery_fee, distance_km, note,
          profiles!user_id(name),
          order_items(menu_item_name, menu_item_emoji, quantity, options)
        `)
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mapped: Order[] = data.map((o: any) => ({
                    id: o.id,
                    user_id: o.user_id,
                    customer: (o.profiles?.name) ?? 'ลูกค้า',
                    delivery_address: o.delivery_address,
                    distance_km: o.distance_km,
                    delivery_fee: o.delivery_fee,
                    note: o.note,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    items: (o.order_items ?? []).map((i: any) => ({
                        name: i.menu_item_name,
                        qty: i.quantity,
                        emoji: i.menu_item_emoji,
                        options: i.options || [],
                    })),
                    total: o.total,
                    status: o.status as Order['status'],
                    created_at: o.created_at,
                }));
                setOrders(mapped);
            }
        } finally {
            setOrdersLoading(false);
        }
    }, [supabase]);

    // Real-time order updates
    useEffect(() => {
        fetchOrders();
        const channel = supabase
            .channel('admin-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchOrders, supabase]);

    // ── Order status update ──────────────────────────────────────────────────────
    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        setStatusUpdating(orderId);
        await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        setStatusUpdating(null);
        fetchOrders();
    };

    // ── Menu handlers ────────────────────────────────────────────────────────────
    const handleToggle = (id: string) =>
        setMenu(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));

    const handleSave = () => {
        if (!editItem) return;
        setMenu(prev => prev.map(m => m.id === editItem.id ? editItem : m));
        setShowEdit(false); setEditItem(null); setUploadFile(null); setUploadPreview(null);
        setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    const handleAddMenu = async () => {
        if (!addForm.name) return;
        const newItem: MenuItem = {
            id: Date.now().toString(),
            name: addForm.name, desc: addForm.desc,
            price: addForm.price, emoji: addForm.emoji,
            category: addForm.category,
            image: addImageUrl || '/menu/som-sainumpeung.jpg',
            isActive: true,
        };
        setMenu(prev => [...prev, newItem]);
        setShowAdd(false); setAddForm(EMPTY_FORM); setAddImageUrl(''); setAddImagePreview('');
        setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    const handleAddImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setAddImagePreview(URL.createObjectURL(file));
        setAddUploading(true);
        try {
            const { url } = await uploadMenuImage(file, 'menu');
            setAddImageUrl(url);
        } finally { setAddUploading(false); }
    };

    const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadFile(file); setUploadOrigSize(file.size); setUploadError('');
        const reader = new FileReader();
        reader.onload = ev => setUploadPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleEditUpload = async () => {
        if (!uploadFile || !editItem) return;
        setUploading(true); setUploadError('');
        try {
            const { url } = await uploadMenuImage(uploadFile, 'menu');
            setEditItem(prev => prev ? { ...prev, image: url } : null);
            setUploadFile(null); setUploadPreview(null);
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally { setUploading(false); }
    };

    const activeCount = menu.filter(m => m.isActive).length;

    // ─── Next status options ──────────────────────────────────────────────────────
    const nextStatuses = (status: Order['status']): { status: Order['status']; label: string; color: string }[] => {
        const map: Record<Order['status'], { status: Order['status']; label: string; color: string }[]> = {
            pending: [{ status: 'preparing', label: '👨‍🍳 เริ่มเตรียม', color: '#007AFF' }, { status: 'cancelled', label: '✕ ยกเลิก', color: '#FF3B30' }],
            preparing: [{ status: 'delivering', label: '🚴 พร้อมจัดส่ง', color: '#34C759' }, { status: 'cancelled', label: '✕ ยกเลิก', color: '#FF3B30' }],
            delivering: [{ status: 'done', label: '✅ ส่งสำเร็จ', color: '#8E8E93' }],
            done: [],
            cancelled: [],
        };
        return map[status] ?? [];
    };

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    // ─── Render ───────────────────────────────────────────────────────────────────
    if (isLoading) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Prompt, sans-serif' }}>⏳ กำลังตรวจสอบสิทธิ์...</div>;
    }

    if (!user || user.email !== 'admin@paotang.com') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Prompt, sans-serif' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>🚫</div>
                <h2 style={{ margin: '0 0 8px' }}>ไม่มีสิทธิ์เข้าถึง</h2>
                <p style={{ color: '#999', margin: '0 0 24px' }}>หน้านี้สงวนไว้สำหรับผู้ดูแลระบบเท่านั้น</p>
                <button className="btn-primary" onClick={() => router.push('/')} style={{ maxWidth: 200 }}>กลับหน้าแรก</button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8F8F8', fontFamily: 'Prompt, sans-serif' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #2D2D2D, #1A1A1A)', padding: '20px 20px 16px', color: 'white', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>← กลับ</button>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🧺 Admin Dashboard</h1>
                        <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>เป๋าตังค์ — จัดการร้านค้า</p>
                    </div>
                    {saved && <span style={{ background: '#34C759', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: 'white' }}>✓ บันทึกแล้ว</span>}
                </div>
            </div>

            <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'เมนูทั้งหมด', value: menu.length, color: '#FF8C42', icon: '🍱' },
                        { label: 'เปิดขาย', value: activeCount, color: '#34C759', icon: '✅' },
                        { label: 'ออเดอร์วันนี้', value: orders.length, color: '#007AFF', icon: '📋' },
                        { label: 'รอดำเนินการ', value: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length, color: '#FF9500', icon: '⏳' },
                    ].map(s => (
                        <div key={s.label} style={{ background: 'white', borderRadius: 14, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' }}>
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
                        }}>
                            {t === 'menu' ? '🍱 จัดการเมนู' : `📋 ออเดอร์ ${orders.filter(o => o.status === 'pending').length > 0 ? `(${orders.filter(o => o.status === 'pending').length})` : ''}`}
                        </button>
                    ))}
                    {tab === 'menu' && (
                        <button onClick={() => setShowAdd(true)} style={{
                            marginLeft: 'auto', padding: '10px 20px', borderRadius: 20, border: 'none',
                            background: 'linear-gradient(135deg, #FF8C42, #F5A623)', color: 'white',
                            fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        }}>+ เพิ่มเมนู</button>
                    )}
                </div>

                {/* ── MENU TAB ── */}
                {tab === 'menu' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                        {menu.map(item => (
                            <div key={item.id} style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: item.isActive ? 1 : 0.6 }}>
                                <div style={{ position: 'relative', height: 160 }}>
                                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="300px" />
                                    {!item.isActive && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>ปิดการขาย</div>}
                                </div>
                                <div style={{ padding: '12px 14px 14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{item.name}</p>
                                            <p style={{ margin: '2px 0 0', color: '#999', fontSize: 11 }}>{item.desc}</p>
                                        </div>
                                        <span style={{ fontWeight: 800, color: '#FF8C42', fontSize: 16, flexShrink: 0 }}>฿{item.price}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button onClick={() => { setEditItem({ ...item }); setShowEdit(true); }} style={{ flex: 1, padding: 8, borderRadius: 8, border: '1.5px solid #EDEDED', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>✏️ แก้ไข</button>
                                        <button onClick={() => handleToggle(item.id)} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'none', background: item.isActive ? '#FFE8E8' : '#E8FFE8', color: item.isActive ? '#FF3B30' : '#34C759', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}>
                                            {item.isActive ? '🔴 ปิดขาย' : '🟢 เปิดขาย'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── ORDERS TAB ── */}
                {tab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {ordersLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>⏳ กำลังโหลด...</div>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ fontSize: 60, marginBottom: 12 }}>📋</div>
                                <p style={{ color: '#999', fontSize: 14 }}>ยังไม่มีออเดอร์</p>
                            </div>
                        ) : (
                            orders.map(order => {
                                const st = STATUS_MAP[order.status];
                                const nexts = nextStatuses(order.status);
                                const isUpdating = statusUpdating === order.id;
                                return (
                                    <div key={order.id} style={{ background: 'white', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                            <div style={{ flex: 1 }}>
                                                <span style={{ fontWeight: 700, fontSize: 14 }}>#{order.id.slice(-6).toUpperCase()}</span>
                                                <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>👤 {order.customer}</span>
                                                <span style={{ color: '#BBB', fontSize: 11, marginLeft: 8 }}>🕐 {formatTime(order.created_at)}</span>
                                            </div>
                                            <span style={{ background: st.color + '20', color: st.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                                                {st.icon} {st.label}
                                            </span>
                                            <span style={{ fontWeight: 800, color: '#FF8C42', fontSize: 16 }}>฿{order.total}</span>
                                        </div>

                                        {order.delivery_address && order.delivery_address !== 'รับที่ร้าน' && (
                                            <div style={{ marginBottom: 10, padding: '8px 12px', background: '#F9F9F9', borderRadius: 8, fontSize: 13, borderLeft: '3px solid #F5A623' }}>
                                                <strong>📍 จัดส่งที่:</strong> {order.delivery_address}
                                                {order.delivery_fee! > 0 && <span style={{ color: '#F5A623', marginLeft: 8 }}>(ค่าส่ง ฿{order.delivery_fee})</span>}
                                            </div>
                                        )}
                                        {order.delivery_address === 'รับที่ร้าน' && (
                                            <div style={{ marginBottom: 10, padding: '8px 12px', background: '#E3F2FD', borderRadius: 8, fontSize: 13, borderLeft: '3px solid #2196F3' }}>
                                                <strong>🏪 รับที่ร้าน</strong>
                                            </div>
                                        )}
                                        {order.note && (
                                            <div style={{ marginBottom: 10, color: '#FF3B30', fontSize: 13, background: '#FFF0EF', padding: '4px 8px', borderRadius: 6 }}>
                                                📝 หมายเหตุ: {order.note}
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                            {order.items.map((item, i) => (
                                                <div key={i} style={{ background: '#FFFBF0', borderRadius: 10, padding: '8px 12px', fontSize: 13, border: '1px solid #FFE5A0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                                        <span>{item.emoji} {item.name}</span>
                                                        <span>×{item.qty}</span>
                                                    </div>
                                                    {item.options && item.options.length > 0 && (
                                                        <div style={{ color: '#777', fontSize: 12, marginTop: 4 }}>
                                                            {item.options.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Status action buttons */}
                                        {nexts.length > 0 && (
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                {nexts.map(n => (
                                                    <button
                                                        key={n.status}
                                                        onClick={() => updateOrderStatus(order.id, n.status)}
                                                        disabled={isUpdating}
                                                        style={{
                                                            padding: '8px 16px', borderRadius: 10, border: 'none',
                                                            background: isUpdating ? '#EEE' : n.color,
                                                            color: 'white', cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                            fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                                                            opacity: isUpdating ? 0.6 : 1,
                                                        }}
                                                    >
                                                        {isUpdating ? '⏳...' : n.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>

            {/* ══ ADD MENU MODAL ══ */}
            {showAdd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                    <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>✨ เพิ่มเมนูใหม่</h2>

                        {/* Image upload */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#555' }}>📸 รูปเมนู</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                {addImagePreview ? (
                                    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                                        <Image src={addImagePreview} alt="preview" fill style={{ objectFit: 'cover' }} sizes="72px" />
                                        {addUploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳</div>}
                                        {!addUploading && addImageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(52,199,89,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✅</div>}
                                    </div>
                                ) : (
                                    <div style={{ width: 72, height: 72, borderRadius: 10, background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>🍊</div>
                                )}
                                <div style={{ flex: 1 }}>
                                    <input ref={addFileRef} type="file" accept="image/*" onChange={handleAddImagePick} style={{ display: 'none' }} />
                                    <button onClick={() => addFileRef.current?.click()} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px dashed #EDEDED', background: '#FAFAFA', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: '#555' }}>
                                        {addUploading ? '⏳ กำลังอัพโหลด...' : '📂 เลือกรูป (บีบอัดอัตโนมัติ)'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {[
                            { label: 'ชื่อเมนู *', key: 'name', type: 'text' },
                            { label: 'รายละเอียด', key: 'desc', type: 'text' },
                            { label: 'ราคา (บาท)', key: 'price', type: 'number' },
                            { label: 'Emoji', key: 'emoji', type: 'text' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5, color: '#555' }}>{f.label}</label>
                                <input
                                    type={f.type}
                                    value={(addForm as Record<string, string | number>)[f.key] as string}
                                    onChange={e => setAddForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #EDEDED', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    placeholder={f.key === 'emoji' ? '🍊' : ''}
                                />
                            </div>
                        ))}

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5, color: '#555' }}>หมวดหมู่</label>
                            <select value={addForm.category} onChange={e => setAddForm(prev => ({ ...prev, category: e.target.value as Category }))}
                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #EDEDED', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 'none', background: 'white' }}>
                                <option value="orange">🍊 ส้ม</option>
                                <option value="pineapple">🍍 สับปะรด</option>
                                <option value="watermelon">🍉 แตงโม</option>
                                <option value="apple">🍎 แอปเปิ้ล</option>
                                <option value="other">🍈 อื่นๆ</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); setAddImageUrl(''); setAddImagePreview(''); }}
                                style={{ flex: 1, padding: 12, border: '1.5px solid #EDEDED', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                                ยกเลิก
                            </button>
                            <button onClick={handleAddMenu} disabled={!addForm.name || addUploading}
                                style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: !addForm.name ? '#DDD' : 'linear-gradient(135deg, #FF8C42, #F5A623)', color: 'white', cursor: !addForm.name ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>
                                ✨ เพิ่มเมนู
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══ EDIT MODAL ══ */}
            {showEdit && editItem && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
                    <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ margin: '0 0 20px', fontSize: 18 }}>✏️ แก้ไข {editItem.name}</h2>

                        {/* Image */}
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#555' }}>📸 รูปเมนู</label>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#FFF3E0' }}>
                                    <Image src={uploadPreview ?? editItem.image} alt={editItem.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditImageChange} style={{ display: 'none' }} />
                                    <button onClick={() => editFileRef.current?.click()} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1.5px dashed #EDEDED', background: '#FAFAFA', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: '#555' }}>📂 เลือกรูปใหม่</button>
                                    {uploadFile && (
                                        <div style={{ marginTop: 6, fontSize: 11, color: '#777' }}>
                                            <p style={{ margin: '0 0 4px' }}>ขนาด: {formatFileSize(uploadOrigSize)} → ~{formatFileSize(uploadOrigSize * 0.35)}</p>
                                            <button onClick={handleEditUpload} disabled={uploading} style={{ padding: '5px 14px', borderRadius: 8, border: 'none', background: uploading ? '#CCC' : '#34C759', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>
                                                {uploading ? '⏳...' : '☁️ อัพโหลด'}
                                            </button>
                                        </div>
                                    )}
                                    {uploadError && <p style={{ margin: '5px 0 0', color: '#FF3B30', fontSize: 11 }}>❌ {uploadError}</p>}
                                </div>
                            </div>
                        </div>

                        {[
                            { label: 'ชื่อเมนู', key: 'name', type: 'text' },
                            { label: 'รายละเอียด', key: 'desc', type: 'text' },
                            { label: 'ราคา (บาท)', key: 'price', type: 'number' },
                        ].map(f => (
                            <div key={f.key} style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 5, color: '#555' }}>{f.label}</label>
                                <input
                                    type={f.type}
                                    value={(editItem as Record<string, string | number | boolean>)[f.key] as string}
                                    onChange={e => setEditItem(prev => prev ? { ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value } : null)}
                                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #EDEDED', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                            <button onClick={() => { setShowEdit(false); setEditItem(null); setUploadFile(null); setUploadPreview(null); }} style={{ flex: 1, padding: 12, border: '1.5px solid #EDEDED', borderRadius: 10, background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>ยกเลิก</button>
                            <button onClick={handleSave} style={{ flex: 1, padding: 12, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #FF8C42, #F5A623)', color: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700 }}>บันทึก ✓</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

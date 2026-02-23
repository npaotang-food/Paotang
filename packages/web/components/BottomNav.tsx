'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
    { icon: '🏠', label: 'หน้าหลัก', path: '/' },
    { icon: '❤️', label: 'ที่ชอบ', path: '/favorites' },
    { icon: '🛒', label: '', path: '/cart', isCenter: true },
    { icon: '📋', label: 'คำสั่งซื้อ', path: '/orders' },
    { icon: '👤', label: 'โปรไฟล์', path: '/profile' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { count } = useCart();

    return (
        <nav className="bottom-nav">
            {NAV_ITEMS.map((item) => {
                if (item.isCenter) {
                    return (
                        <div
                            key={item.path}
                            className="bottom-nav-center"
                            onClick={() => router.push('/cart')}
                            style={{ position: 'relative' }}
                        >
                            🛒
                            {count > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: -4,
                                    right: -4,
                                    background: '#FF3B30',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 20,
                                    height: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {count}
                                </span>
                            )}
                        </div>
                    );
                }
                const isActive = pathname === item.path;
                return (
                    <div
                        key={item.path}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => router.push(item.path)}
                    >
                        <span style={{ fontSize: 22 }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                );
            })}
        </nav>
    );
}

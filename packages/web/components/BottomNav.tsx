'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const NAV_ITEMS = [
    { icon: '🏠', label: 'หน้าหลัก', path: '/' },
    { icon: '🔍', label: 'ค้นหา', path: '/search' },
    { icon: '🛒', label: '', path: '/cart', isCenter: true },
    { icon: '📋', label: 'ออเดอร์', path: '/orders' },
    { icon: '👤', label: 'โปรไฟล์', path: '/profile' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { count } = useCart();

    return (
        <nav className="bottom-nav" style={{ backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.95)' }}>
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
                                    position: 'absolute', top: -4, right: -4,
                                    background: '#FF3B30', color: 'white', borderRadius: '50%',
                                    width: 20, height: 20, fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                        style={{ position: 'relative', transition: 'transform 0.15s' }}
                    >
                        {isActive && (
                            <span style={{
                                position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                                width: 24, height: 3, borderRadius: 3,
                                background: 'var(--color-primary)',
                            }} />
                        )}
                        <span style={{ fontSize: 22, transition: 'transform 0.15s', transform: isActive ? 'scale(1.15)' : 'scale(1)' }}>
                            {item.icon}
                        </span>
                        <span style={{ fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
                    </div>
                );
            })}
        </nav>
    );
}

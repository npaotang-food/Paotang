'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
    { href: '/', label: 'หน้าหลัก', emoji: '🏠' },
    { href: '/cart', label: 'ตะกร้า', emoji: '🛒' },
    { href: '/orders', label: 'คำสั่งซื้อ', emoji: '📋' },
    { href: '/favorites', label: 'ที่ชอบ', emoji: '❤️' },
    { href: '/profile', label: 'โปรไฟล์', emoji: '👤' },
];

export default function DesktopSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { count } = useCart();
    const { isLoggedIn, profile, user } = useAuth();

    const isAdmin = user?.email === 'admin@paotang.com';

    return (
        <aside className="desktop-sidebar">
            {/* Logo */}
            <div className="sidebar-logo" onClick={() => router.push('/')}>
                <div className="sidebar-logo-icon">🧺</div>
                <div>
                    <div className="sidebar-logo-name">เป๋าตังค์</div>
                    <div className="sidebar-logo-sub">ผลไม้ปอกสด</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {NAV_LINKS.map(link => {
                    const isActive = pathname === link.href;
                    const isCart = link.href === '/cart';
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">{link.emoji}</span>
                            <span>{link.label}</span>
                            {isCart && count > 0 && (
                                <span className="sidebar-cart-badge">{count}</span>
                            )}
                        </Link>
                    );
                })}
                {isAdmin && (
                    <Link
                        href="/admin"
                        className={`sidebar-nav-item ${pathname.startsWith('/admin') ? 'active' : ''}`}
                    >
                        <span className="sidebar-nav-icon">⚙️</span>
                        <span>Admin</span>
                    </Link>
                )}
            </nav>

            {/* Footer — Profile or Login */}
            <div className="sidebar-footer">
                {isLoggedIn ? (
                    <div className="sidebar-profile" onClick={() => router.push('/profile')}>
                        <div className="sidebar-avatar">
                            {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </div>
                        <div className="sidebar-profile-info">
                            <div className="sidebar-profile-name">{profile?.name ?? 'ผู้ใช้'}</div>
                            <div className="sidebar-profile-points">🪙 {profile?.points ?? 0} แต้ม</div>
                        </div>
                    </div>
                ) : (
                    <button className="sidebar-login-btn" onClick={() => router.push('/profile')}>
                        <span>🔑</span> เข้าสู่ระบบ
                    </button>
                )}
            </div>
        </aside>
    );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Props {
    onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
    const { login, register } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = async () => {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }
        setIsLoading(true);
        setError('');

        let result;
        if (isRegister) {
            result = await register(trimmedEmail, trimmedPassword, name || trimmedEmail.split('@')[0]);
        } else {
            result = await login(trimmedEmail, trimmedPassword);
        }

        if (result.error) {
            const thaiErrors: Record<string, string> = {
                'Invalid login credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
                'Email not confirmed': 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
                'User already registered': 'อีเมลนี้ถูกใช้งานแล้ว',
                'Password should be at least 6 characters': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
            };
            setError(thaiErrors[result.error] ?? result.error);
        } else {
            onClose();
        }
        setIsLoading(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-center" onClick={e => e.stopPropagation()}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{
                        width: 72, height: 72,
                        background: 'linear-gradient(135deg, #FFF3DC, #F5A623)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, margin: '0 auto 12px',
                        boxShadow: '0 4px 16px rgba(245,166,35,0.3)',
                    }}>
                        🐾
                    </div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#F5A623' }}>
                        {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                    </h2>
                    <p style={{ margin: '6px 0 0', color: '#999', fontSize: 13 }}>
                        {isRegister ? 'สร้างบัญชีใหม่ ง่ายนิดเดียว 🌟' : 'ยินดีต้อนรับกลับสู่ครอบครัว'}
                    </p>
                </div>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    {isRegister && (
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>👤</span>
                            <input
                                className="input-field"
                                placeholder="ชื่อ-นามสกุล"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{ paddingLeft: 44 }}
                            />
                        </div>
                    )}
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>✉️</span>
                        <input
                            className="input-field"
                            type="email"
                            placeholder="อีเมล"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ paddingLeft: 44 }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔒</span>
                        <input
                            className="input-field"
                            type="password"
                            placeholder="รหัสผ่าน (อย่างน้อย 6 ตัว)"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{ paddingLeft: 44 }}
                            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                        />
                    </div>
                    {error && (
                        <p style={{
                            color: '#FF3B30', fontSize: 12, margin: 0,
                            background: '#FFF0EF', padding: '8px 12px', borderRadius: 8,
                        }}>⚠️ {error}</p>
                    )}
                </div>

                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.7 : 1 }}
                >
                    {isLoading ? '⏳ กำลังดำเนินการ...' : isRegister ? 'สร้างบัญชี' : 'เริ่มต้นการใช้งาน'}
                </button>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#777' }}>
                    {isRegister ? 'มีบัญชีแล้ว? ' : 'ยังไม่มีบัญชี? '}
                    <button
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{ background: 'none', border: 'none', color: '#F5A623', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                        {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                    </button>
                </p>
            </div>
        </div>
    );
}

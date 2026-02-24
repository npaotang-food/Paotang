'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface OrderInfo {
    id: string;
    delivery_address: string;
    dest_lat: number;
    dest_lng: number;
    customer: string;
}

export default function DriverPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const supabase = createClient();

    const [order, setOrder] = useState<OrderInfo | null>(null);
    const [sharing, setSharing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [watchId, setWatchId] = useState<number | null>(null);

    // Fetch order info
    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from('orders')
                .select('id, delivery_address, delivery_lat, delivery_lng, user_id')
                .eq('id', orderId)
                .single();
            if (data) {
                setOrder({
                    id: data.id,
                    delivery_address: data.delivery_address || 'ที่อยู่ลูกค้า',
                    dest_lat: data.delivery_lat || 13.7563,
                    dest_lng: data.delivery_lng || 100.5018,
                    customer: data.user_id?.slice(0, 8) || '...',
                });
            }
        };
        if (orderId) load();
    }, [orderId, supabase]);

    // Push GPS to database
    const pushLocation = useCallback(async (lat: number, lng: number) => {
        await supabase.from('orders').update({
            driver_lat: lat,
            driver_lng: lng,
            driver_updated_at: new Date().toISOString(),
        }).eq('id', orderId);
        setLastUpdate(new Date().toLocaleTimeString('th-TH'));
    }, [orderId, supabase]);

    const startSharing = () => {
        if (!navigator.geolocation) {
            setError('Browser ของคุณไม่รองรับ GPS');
            return;
        }
        setSharing(true);
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                pushLocation(pos.coords.latitude, pos.coords.longitude);
            },
            (err) => setError('ไม่สามารถดึง GPS ได้: ' + err.message),
            { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
        );
        setWatchId(id);
    };

    const stopSharing = () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        setSharing(false);
        setWatchId(null);
    };

    const openNavigation = () => {
        if (!order) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${order.dest_lat},${order.dest_lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#1A1A1A',
            fontFamily: 'Prompt, sans-serif', color: 'white',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '32px 20px', gap: 20,
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>🛵</div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>คนส่งของ</h1>
                <p style={{ margin: '4px 0 0', opacity: 0.6, fontSize: 13 }}>เป๋าตังค์ Driver</p>
            </div>

            {/* Order card */}
            {order && (
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, width: '100%', maxWidth: 380 }}>
                    <div style={{ fontSize: 12, opacity: 0.5, marginBottom: 4 }}>ออเดอร์ #{order.id.slice(0, 8)}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>📍 {order.delivery_address}</div>
                    <div style={{ fontSize: 12, opacity: 0.5 }}>ลูกค้า: {order.customer}</div>
                </div>
            )}

            {/* Live status */}
            {sharing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1B5E20', padding: '10px 20px', borderRadius: 20 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34C759', display: 'inline-block', animation: 'pulseDot 1.2s infinite' }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>แชร์ GPS อยู่</span>
                    {lastUpdate && <span style={{ opacity: 0.6, fontSize: 12 }}>อัปเดต {lastUpdate}</span>}
                </div>
            )}

            {error && (
                <div style={{ background: '#B71C1C', borderRadius: 12, padding: '10px 16px', fontSize: 14, maxWidth: 380, width: '100%', textAlign: 'center' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 380 }}>
                {/* Google Maps Navigation */}
                <button
                    onClick={openNavigation}
                    style={{
                        padding: '18px', borderRadius: 16, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #34A853, #1E7E34)',
                        color: 'white', fontFamily: 'Prompt, sans-serif', fontWeight: 700, fontSize: 17,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: '0 4px 20px rgba(52,168,83,0.4)',
                    }}
                >
                    <span style={{ fontSize: 22 }}>🗺️</span>
                    นำทาง Google Maps
                </button>

                {/* GPS Share toggle */}
                {!sharing ? (
                    <button
                        onClick={startSharing}
                        style={{
                            padding: '16px', borderRadius: 16, border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #F5A623, #E09010)',
                            color: 'white', fontFamily: 'Prompt, sans-serif', fontWeight: 700, fontSize: 15,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        }}
                    >
                        <span>📡</span> เริ่มแชร์ตำแหน่ง GPS
                    </button>
                ) : (
                    <button
                        onClick={stopSharing}
                        style={{
                            padding: '16px', borderRadius: 16, border: '2px solid rgba(255,255,255,0.2)',
                            background: 'transparent', cursor: 'pointer',
                            color: 'white', fontFamily: 'Prompt, sans-serif', fontWeight: 700, fontSize: 15,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        }}
                    >
                        ⏹️ หยุดแชร์ GPS
                    </button>
                )}
            </div>

            {/* Instructions */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px', maxWidth: 380, width: '100%', fontSize: 13, lineHeight: 1.7, opacity: 0.7 }}>
                <strong style={{ opacity: 1 }}>วิธีใช้:</strong><br />
                1. กด <strong>นำทาง Google Maps</strong> เพื่อเปิดแผนที่นำทาง<br />
                2. กด <strong>เริ่มแชร์ GPS</strong> เพื่อให้ลูกค้าเห็นตำแหน่งคุณ<br />
                3. กด <strong>หยุด</strong> เมื่อส่งสินค้าเสร็จแล้ว
            </div>
        </div>
    );
}

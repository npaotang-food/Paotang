'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DeliveryMapProps {
    destLat: number;
    destLng: number;
    storeLat?: number;
    storeLng?: number;
    addressLabel?: string;
    orderId?: string;
    onClose?: () => void;
}

export default function DeliveryMap({ destLat, destLng, storeLat, storeLng, addressLabel, orderId, onClose }: DeliveryMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<unknown>(null);
    const driverMarkerRef = useRef<unknown>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);
    const [eta, setEta] = useState<number | null>(null);
    const supabase = createClient();

    // Poll driver position from Supabase every 5 seconds
    useEffect(() => {
        if (!orderId) return;
        const poll = async () => {
            const { data } = await supabase
                .from('orders')
                .select('driver_lat, driver_lng, driver_updated_at')
                .eq('id', orderId)
                .single();
            if (data?.driver_lat && data?.driver_lng) {
                setDriverPos({ lat: data.driver_lat, lng: data.driver_lng });
            }
        };
        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [orderId, supabase]);

    // Estimate ETA (mock: based on distance from driver to dest)
    useEffect(() => {
        if (!driverPos) return;
        const dx = destLat - driverPos.lat;
        const dy = destLng - driverPos.lng;
        const distDeg = Math.sqrt(dx * dx + dy * dy);
        const distKm = distDeg * 111;
        const etaMin = Math.max(1, Math.round((distKm / 30) * 60)); // assume 30 km/h
        setEta(etaMin);
    }, [driverPos, destLat, destLng]);

    // Init map
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        if (!L || !mapRef.current) return;

        const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
            .setView([destLat, destLng], 15);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

        const pinIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(245,166,35,0.4)); transform: translate(-10px, -30px)">📍</div>`,
            iconSize: [32, 32],
        });
        const storeIcon = L.divIcon({
            className: 'custom-store-pin',
            html: `<div style="font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transform: translate(-14px, -28px)">🏪</div>`,
            iconSize: [32, 32]
        });
        const driverIcon = L.divIcon({
            className: 'custom-driver-pin',
            html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3)); transform: translate(-12px, -24px)">🛵</div>`,
            iconSize: [28, 28]
        });

        L.marker([destLat, destLng], { icon: pinIcon }).addTo(map);

        const sLat = storeLat ?? (destLat + 0.008);
        const sLng = storeLng ?? (destLng + 0.008);
        L.marker([sLat, sLng], { icon: storeIcon }).addTo(map);
        L.polyline([[sLat, sLng], [sLat, destLng], [destLat, destLng]], {
            color: '#BDBDBD', weight: 3, dashArray: '6, 6'
        }).addTo(map);

        // Driver marker (starts at store if no GPS yet)
        const initLat = driverPos?.lat ?? sLat;
        const initLng = driverPos?.lng ?? sLng;
        const dMarker = L.marker([initLat, initLng], { icon: driverIcon }).addTo(map);
        driverMarkerRef.current = dMarker;

        map.fitBounds(L.latLngBounds([sLat, sLng], [destLat, destLng]), { padding: [48, 48] });
        setTimeout(() => setIsMapLoaded(true), 300);

        return () => { map.remove(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [destLat, destLng, storeLat, storeLng]);

    // Update driver marker when position changes
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const marker = driverMarkerRef.current as any;
        if (marker && driverPos) {
            marker.setLatLng([driverPos.lat, driverPos.lng]);
        }
    }, [driverPos]);

    const openNavigation = useCallback(() => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`, '_blank');
    }, [destLat, destLng]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.2s',
        }}>
            <div style={{
                background: 'white', width: '100%', height: '88vh',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #F0F0F0'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            {driverPos
                                ? <><span className="live-dot" /><h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Live Tracking 🛵</h3></>
                                : <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>ที่อยู่จัดส่ง 📍</h3>
                            }
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: '#777' }}>{addressLabel || 'กำลังโหลดตำแหน่ง...'}</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} style={{
                            background: '#F5F5F5', border: 'none', width: 36, height: 36, borderRadius: '50%',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>✕</button>
                    )}
                </div>

                {/* ETA bar — show only if driver is sharing GPS */}
                {driverPos && (
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid #F5F5F5', background: '#FAFAF9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: '#555' }}>🛵 คนส่งกำลังเดินทาง</span>
                            {eta !== null && <span className="eta-badge">🕒 ~{eta} นาที</span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#999' }}>
                            <span>📡 GPS อัปเดตทุก 5 วินาที</span>
                            <span style={{ color: '#34C759', fontWeight: 600 }}>● LIVE</span>
                        </div>
                    </div>
                )}

                {!driverPos && isMapLoaded && (
                    <div style={{ padding: '10px 20px', background: '#FFF8E7', borderBottom: '1px solid #FFE0B2', fontSize: 13, color: '#E65100', textAlign: 'center' }}>
                        ⏳ รอคนขับเริ่มแชร์ตำแหน่ง GPS...
                    </div>
                )}

                {/* Map */}
                <div style={{ flex: 1, position: 'relative', background: '#F5F5F5' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
                    {!isMapLoaded && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#F5F5F5', gap: 8 }}>
                            <div style={{ fontSize: 40, animation: 'floatIcon 1.5s ease-in-out infinite' }}>🗺️</div>
                            <p style={{ color: '#999', fontSize: 13, margin: 0 }}>กำลังโหลดแผนที่...</p>
                        </div>
                    )}

                    {/* Open in Google Maps */}
                    {isMapLoaded && (
                        <div style={{ position: 'absolute', bottom: 20, right: 16, zIndex: 10 }}>
                            <button
                                onClick={openNavigation}
                                style={{
                                    background: '#34A853', color: 'white', padding: '10px 18px', borderRadius: 24,
                                    border: 'none', fontFamily: 'Prompt, sans-serif', fontWeight: 600, fontSize: 13,
                                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(52,168,83,0.35)'
                                }}
                            >
                                🗺️ Google Maps
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

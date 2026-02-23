'use client';

import { useEffect, useRef, useState } from 'react';

interface DeliveryMapProps {
    destLat: number;
    destLng: number;
    driverLat?: number;
    driverLng?: number;
    addressLabel?: string;
    onClose?: () => void;
}

export default function DeliveryMap({ destLat, destLng, driverLat, driverLng, addressLabel, onClose }: DeliveryMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    useEffect(() => {
        // Wait for Leaflet to be loaded globally via Next Script
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L;
        if (!L || !mapRef.current) return;

        // Initialize Map
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([destLat, destLng], 15);

        // Add TileLayer (OpenStreetMap)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Create Pin icon
        const pinIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(245,166,35,0.4)); transform: translate(-10px, -30px)">📍</div>`,
            iconSize: [32, 32],
        });

        const driverIcon = L.divIcon({
            className: 'custom-driver-pin',
            html: `<div style="font-size: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transform: translate(-15px, -32px)">🏍️</div>`,
            iconSize: [36, 36]
        });

        // Add Destination Marker
        L.marker([destLat, destLng], { icon: pinIcon }).addTo(map);

        // Add Driver Marker & Route if coords exist (mock delivery)
        if (driverLat && driverLng) {
            L.marker([driverLat, driverLng], { icon: driverIcon }).addTo(map);

            // Draw a simple polyline route
            const latlngs = [
                [driverLat, driverLng],
                [driverLat, destLng], // orthogonal routing for visual effect
                [destLat, destLng]
            ];
            L.polyline(latlngs, { color: '#F5A623', weight: 4, dashArray: '8, 8' }).addTo(map);

            // Adjust bounds to fit both
            map.fitBounds(L.latLngBounds([driverLat, driverLng], [destLat, destLng]), { padding: [40, 40] });
        }

        setIsMapLoaded(true);

        return () => {
            map.remove();
        };
    }, [destLat, destLng, driverLat, driverLng]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.2s',
        }}>
            <div style={{
                background: 'white', width: '100%', height: '85vh',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #F0F0F0', position: 'relative', zIndex: 10
                }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>ที่อยู่จัดส่ง</h3>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#777' }}>
                            {addressLabel || 'กำลังโหลดตำแหน่ง...'}
                        </p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} style={{
                            background: '#F5F5F5', border: 'none', width: 36, height: 36, borderRadius: '50%',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}>✕</button>
                    )}
                </div>

                {/* Map Container */}
                <div style={{ flex: 1, position: 'relative', background: '#F5F5F5' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

                    {!isMapLoaded && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#F5F5F5' }}>
                            ⏳ กำลังโหลดแผนที่...
                        </div>
                    )}

                    {/* Overlay Stats (from Reference UI) */}
                    {isMapLoaded && (
                        <div style={{
                            position: 'absolute', top: 16, left: 16, zIndex: 10,
                            background: 'white', padding: '10px 16px', borderRadius: 20,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            display: 'flex', gap: 16, fontWeight: 600, fontSize: 13
                        }}>
                            <div><span style={{ color: '#F5A623' }}>📍</span> 1.10 กม.</div>
                            <div><span style={{ color: '#F5A623' }}>🕒</span> ~2 นาที</div>
                        </div>
                    )}

                    {/* Open in Google Maps Button */}
                    <div style={{
                        position: 'absolute', bottom: 24, right: 24, zIndex: 10,
                    }}>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{
                                background: '#F5A623', color: 'white', padding: '12px 20px', borderRadius: 24,
                                textDecoration: 'none', fontWeight: 600, fontSize: 14,
                                display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 4px 12px rgba(245,166,35,0.3)'
                            }}
                        >
                            <span>↗️ เปิดใน Google Maps</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Add keyframes to global context later if not exist

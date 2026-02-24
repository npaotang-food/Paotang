'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    storeLat?: number;
    storeLng?: number;
    onSelect: (location: Location) => void;
    onClose: () => void;
}

export default function MapPicker({ initialLat = 13.7563, initialLng = 100.5018, storeLat, storeLng, onSelect, onClose }: MapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [center, setCenter] = useState({ lat: initialLat, lng: initialLng });
    const [addressText, setAddressText] = useState('กำลังดึงข้อมูลที่อยู่...');
    const [isDragging, setIsDragging] = useState(false);
    const mapInstance = useRef<any>(null);

    // Reverse Geocoding using Nominatim (OpenStreetMap)
    const fetchAddress = useCallback(async (lat: number, lng: number) => {
        try {
            setAddressText('กำลังดึงข้อมูลที่อยู่...');
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            if (data && data.display_name) {
                // Formatting Thai address from parts if available
                const addr = data.address;
                const shortAddr = addr.road || addr.suburb || addr.neighbourhood || addr.city || '';
                const fullAddr = `${shortAddr ? shortAddr + ', ' : ''}${addr.city || addr.state || ''} ${addr.postcode || ''}`.trim() || data.display_name;
                setAddressText(fullAddr);
            } else {
                setAddressText(`ละติจูด: ${lat.toFixed(5)}, ลองจิจูด: ${lng.toFixed(5)}`);
            }
        } catch (e) {
            setAddressText(`ละติจูด: ${lat.toFixed(5)}, ลองจิจูด: ${lng.toFixed(5)}`);
        }
    }, []);

    useEffect(() => {
        // Wait for Leaflet to be loaded globally via Next Script
        const L = (window as any).L;
        if (!L || !mapRef.current) return;

        // Initialize Map
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([initialLat, initialLng], 16);

        mapInstance.current = map;

        // Add TileLayer (OpenStreetMap)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Add Store Marker if provided
        if (storeLat && storeLng) {
            const storeIcon = L.divIcon({
                className: 'custom-store-pin',
                html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2)); transform: translate(-10px, -30px)">🏪</div>`,
                iconSize: [32, 32],
            });
            L.marker([storeLat, storeLng], { icon: storeIcon }).addTo(map);
        }

        // Fetch initial address
        fetchAddress(initialLat, initialLng);

        // Map Event Listeners for picking center
        map.on('movestart', () => {
            setIsDragging(true);
        });

        map.on('moveend', () => {
            setIsDragging(false);
            const newCenter = map.getCenter();
            setCenter({ lat: newCenter.lat, lng: newCenter.lng });
            fetchAddress(newCenter.lat, newCenter.lng);
        });

        setIsMapLoaded(true);

        return () => {
            map.remove();
        };
    }, [initialLat, initialLng, fetchAddress]);

    const handleConfirm = () => {
        onSelect({
            lat: center.lat,
            lng: center.lng,
            address: addressText
        });
    };

    const requestLocation = () => {
        if (navigator.geolocation && mapInstance.current) {
            setAddressText('กำลังค้นหาตำแหน่งของคุณ...');
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                mapInstance.current.setView([latitude, longitude], 17);
                setCenter({ lat: latitude, lng: longitude });
                fetchAddress(latitude, longitude);
            }, (error) => {
                console.error("Error getting location", error);
                alert("ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาเปิด GPS");
                setAddressText('ไม่สามารถเข้าถึงตำแหน่งของคุณได้');
            });
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
            animation: 'fadeIn 0.2s',
        }}>
            <div style={{
                background: 'white', width: '100%', height: '90vh',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid #F0F0F0', position: 'relative', zIndex: 10
                }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>เลือกตำแหน่งจัดส่ง</h3>
                    <button onClick={onClose} style={{
                        background: '#F5F5F5', border: 'none', width: 36, height: 36, borderRadius: '50%',
                        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>✕</button>
                </div>

                {/* Map Container */}
                <div style={{ flex: 1, position: 'relative', background: '#F5F5F5' }}>
                    <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

                    {!isMapLoaded && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, background: '#F5F5F5' }}>
                            ⏳ กำลังโหลดแผนที่...
                        </div>
                    )}

                    {/* Target Reticle (Center Pin) */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -100%)', zIndex: 10,
                        pointerEvents: 'none', // let map drag underneath
                        transition: 'transform 0.2s',
                        marginTop: isDragging ? '-10px' : '0' // Bounce effect when dragging
                    }}>
                        <div style={{ fontSize: 40, filter: 'drop-shadow(0 4px 6px rgba(245,166,35,0.4))' }}>
                            📍
                        </div>
                        {/* Shadow dot */}
                        <div style={{
                            width: 10, height: 4, background: 'rgba(0,0,0,0.3)', borderRadius: '50%',
                            position: 'absolute', bottom: -2, left: 15, transform: isDragging ? 'scale(0.5)' : 'scale(1)',
                            transition: 'transform 0.2s'
                        }} />
                    </div>

                    {/* Current Location Button */}
                    <button
                        onClick={requestLocation}
                        style={{
                            position: 'absolute', bottom: 20, right: 16, zIndex: 10,
                            width: 44, height: 44, borderRadius: '50%', background: 'white',
                            border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 20, cursor: 'pointer', color: '#007AFF'
                        }}
                    >
                        🎯
                    </button>
                </div>

                {/* Footer Action */}
                <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #F0F0F0', zIndex: 10 }}>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>ที่อยู่ที่เลือก</div>
                        <div style={{ fontWeight: 600, fontSize: 15, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {addressText}
                        </div>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={isDragging}
                        style={{
                            width: '100%', padding: '16px', background: isDragging ? '#CCC' : '#F5A623',
                            color: 'white', borderRadius: '24px', fontWeight: 700, fontSize: 16,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            border: 'none', cursor: isDragging ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        ยืนยันตำแหน่งนี้ {isDragging && '...'}
                    </button>
                </div>
            </div>
        </div>
    );
}

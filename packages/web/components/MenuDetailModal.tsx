'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface Option {
    id: string;
    label: string;
    priceAddOn: number;
}

interface MenuItem {
    id: string;
    name: string;
    desc: string;
    price: number;
    emoji: string;
    options?: { label: string; items: Option[] };
}

interface Props {
    item: MenuItem;
    onClose: () => void;
}

export default function MenuDetailModal({ item, onClose }: Props) {
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);
    const [selectedOption, setSelectedOption] = useState<Option | null>(
        item.options?.items[0] ?? null
    );
    const [note, setNote] = useState('');
    const [added, setAdded] = useState(false);

    const basePrice = item.price + (selectedOption?.priceAddOn ?? 0);
    const total = basePrice * qty;

    const handleAdd = () => {
        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: qty,
            emoji: item.emoji,
            selectedOption: selectedOption ?? undefined,
        });
        setAdded(true);
        setTimeout(() => {
            setAdded(false);
            onClose();
        }, 800);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ paddingBottom: 0 }}>
                {/* Image header */}
                <div style={{
                    background: 'linear-gradient(135deg, #2D7A45, #4A9B5E)',
                    borderRadius: '28px 28px 0 0',
                    padding: '40px 20px 24px',
                    textAlign: 'center',
                    position: 'relative',
                }}>
                    <button onClick={onClose} style={{
                        position: 'absolute', top: 16, right: 16,
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: 'white',
                    }}>✕</button>
                    <button style={{
                        position: 'absolute', top: 16, left: 16,
                        background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                        width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: 'white',
                    }}>♡</button>
                    <div style={{ fontSize: 80 }}>{item.emoji}</div>
                </div>

                {/* Info */}
                <div style={{ padding: '20px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{item.name}</h2>
                        <span style={{ color: '#F5A623', fontWeight: 700, fontSize: 18 }}>฿{item.price}</span>
                    </div>
                    <p style={{ margin: '8px 0 0', color: '#777', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
                </div>

                {/* Options */}
                {item.options && (
                    <div style={{ padding: '0 20px 16px' }}>
                        <div style={{
                            border: '1px solid #EDEDED', borderRadius: 12, padding: '12px 16px',
                        }}>
                            <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>{item.options.label}</p>
                            {item.options.items.map(opt => (
                                <label key={opt.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 0', cursor: 'pointer',
                                    borderBottom: opt !== item.options!.items[item.options!.items.length - 1] ? '1px solid #F5F5F5' : 'none',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input
                                            type="radio"
                                            name="option"
                                            checked={selectedOption?.id === opt.id}
                                            onChange={() => setSelectedOption(opt)}
                                            style={{ accentColor: '#F5A623', width: 18, height: 18 }}
                                        />
                                        <span style={{ fontSize: 14 }}>{opt.label}</span>
                                    </div>
                                    <span style={{ color: '#F5A623', fontSize: 14 }}>+฿{opt.priceAddOn}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Note */}
                <div style={{ padding: '0 20px 16px' }}>
                    <div style={{ border: '1px solid #EDEDED', borderRadius: 12, padding: '12px 16px' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>หมายเหตุเพิ่มเติม</p>
                        <textarea
                            className="input-field"
                            placeholder="เช่น ใส่น้ำแข็งน้อย, แยกน้ำ..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            style={{ resize: 'none', height: 72, border: 'none', padding: 0, background: 'transparent' }}
                        />
                    </div>
                </div>

                {/* Qty + Add to cart */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '16px 20px 32px', background: 'white',
                    borderTop: '1px solid #F5F5F5',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button
                            onClick={() => setQty(Math.max(1, qty - 1))}
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                border: '1.5px solid #EDEDED', background: 'white',
                                fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >−</button>
                        <span style={{ fontSize: 18, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                        <button
                            onClick={() => setQty(qty + 1)}
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #F5A623, #E09010)',
                                border: 'none', color: 'white',
                                fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >+</button>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleAdd}
                        style={{ transition: 'all 0.2s', background: added ? 'linear-gradient(135deg, #4A9B5E, #2D7A45)' : undefined }}
                    >
                        {added ? '✓ เพิ่มแล้ว!' : `เพิ่มลงตะกร้า - ฿${total}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

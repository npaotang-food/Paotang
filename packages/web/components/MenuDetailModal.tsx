'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface MenuItem {
    id: string;
    name: string;
    desc: string;
    price: number;
    emoji: string;
    category?: string;
}

interface Props {
    item: MenuItem;
    onClose: () => void;
}

const DIP_OPTIONS = ['ไม่รับเครื่องจิ้ม', 'พริกเกลือลาว', 'พริกเกลือเค็ม', 'พริกเกลือหวาน', 'ผงบ๊วยพิเศษ', 'พริกเกลือกะปิ'];
const CHILL_OPTIONS = ['แช่เย็นจัด ❄️', 'อุณหภูมิห้อง 🌡️'];

export default function MenuDetailModal({ item, onClose }: Props) {
    const { addItem } = useCart();
    const [qty, setQty] = useState(1);

    // Add-ons State
    const [selectedDip, setSelectedDip] = useState<string>(DIP_OPTIONS[0]);
    const [selectedChill, setSelectedChill] = useState<string>(CHILL_OPTIONS[0]);
    const [note, setNote] = useState('');

    const [added, setAdded] = useState(false);

    const total = item.price * qty;

    const handleAdd = () => {
        const options = [];
        if (selectedDip !== 'ไม่รับเครื่องจิ้ม') options.push(`เครื่องจิ้ม: ${selectedDip}`);
        options.push(selectedChill);

        addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: qty,
            emoji: item.emoji,
            options,
            note: note.trim() || undefined,
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

                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Add-ons: เครื่องจิ้ม */}
                    <div style={{ border: '1px solid #EDEDED', borderRadius: 12, padding: '12px 16px' }}>
                        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>เลือกเครื่องจิ้ม (แถมฟรี 1 อย่าง)</p>
                        {DIP_OPTIONS.map((dip, idx) => (
                            <label key={idx} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '8px 0', cursor: 'pointer',
                                borderBottom: idx !== DIP_OPTIONS.length - 1 ? '1px solid #F5F5F5' : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input
                                        type="radio"
                                        checked={selectedDip === dip}
                                        onChange={() => setSelectedDip(dip)}
                                        style={{ accentColor: '#F5A623', width: 18, height: 18 }}
                                    />
                                    <span style={{ fontSize: 14 }}>{dip}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    {/* Add-ons: ความเย็น */}
                    <div style={{ border: '1px solid #EDEDED', borderRadius: 12, padding: '12px 16px' }}>
                        <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: 14 }}>ระดับความเย็น</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {CHILL_OPTIONS.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedChill(opt)}
                                    style={{
                                        flex: 1, padding: '10px', borderRadius: 8, fontFamily: 'inherit', fontSize: 13,
                                        border: selectedChill === opt ? '1.5px solid #F5A623' : '1.5px solid #EDEDED',
                                        background: selectedChill === opt ? '#FFF3DC' : 'white',
                                        color: selectedChill === opt ? '#E09010' : '#555',
                                        fontWeight: selectedChill === opt ? 600 : 400,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div style={{ border: '1px solid #EDEDED', borderRadius: 12, padding: '12px 16px' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 14 }}>หมายเหตุเพิ่มเติม</p>
                        <textarea
                            className="input-field"
                            placeholder="เช่น หั่นชิ้นเล็ก, แยกน้ำ..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            style={{ resize: 'none', height: 60, border: 'none', padding: 0, background: 'transparent' }}
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
                            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #EDEDED', background: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >−</button>
                        <span style={{ fontSize: 18, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{qty}</span>
                        <button
                            onClick={() => setQty(qty + 1)}
                            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F5A623, #E09010)', border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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

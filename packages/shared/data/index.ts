import type { User, MenuItem, Category, Banner, Address, Order } from '../types';

export const mockUser: User = {
    id: '1',
    name: 'Guest',
    email: 'guest@paotang.com',
    points: 1516,
    tier: 'Gold',
    avatarInitials: 'GU',
};

export const categories: Category[] = [
    { id: 'recommend', name: 'เมนูแนะนำ', icon: '⭐' },
    { id: 'all', name: 'เมนูทั้งหมด', icon: '☕' },
    { id: 'favorite', name: 'เมนูที่ชอบ', icon: '❤️' },
    { id: 'tea', name: 'ชาใส', icon: '🍵' },
    { id: 'fruittea', name: 'ชานมผลไม้', icon: '🍎' },
];

export const menuItems: MenuItem[] = [
    {
        id: '1',
        name: 'ชาไทยซีส',
        description: 'ชาไทยรสเข้มข้นยอดฮิต เพิ่มความนัวด้วยชีสนุ่มๆ อร่อยแบบไทยๆ',
        price: 50,
        image: '',
        category: 'recommend',
        isFavorite: false,
    },
    {
        id: '2',
        name: 'สตอเบอร์รีลาเต้',
        description: 'นมสตอเบอร์รีเปรี้ยวหวานสดชื่น แยกชั้นสวยงาม ดื่มแล้วสดชื่น',
        price: 35,
        image: '',
        category: 'recommend',
        isFavorite: true,
    },
    {
        id: '3',
        name: 'ชาชีสลิ้นจี่',
        description: 'ชาลิ้นจี่รสละมุน หอมกลิ่นผลไม้เมืองร้อน ท็อปด้วยชีสนุ่มๆ',
        price: 85,
        image: '',
        category: 'recommend',
        isFavorite: false,
    },
    {
        id: '4',
        name: 'พายบานอฟฟี่',
        description: 'พายตกแต่งด้วยกล้วยหอม คาราเมลซอสและวิปครีม พร้อมผงโกโก้คุณภาพเยี่ยม',
        price: 150,
        image: '',
        category: 'recommend',
        isFavorite: false,
        options: {
            label: 'ขนาด (เลือก 1 ข้อ)',
            items: [
                { id: 'opt1', label: '1 ปอนด์', priceAddOn: 750 },
                { id: 'opt2', label: '2 ปอนด์', priceAddOn: 1650 },
            ],
        },
    },
    {
        id: '5',
        name: 'มัทฉะลาเต้',
        description: 'มัทฉะญี่ปุ่นแท้ ผสมนมสดเนื้อเนียน หอมกลิ่นชาเขียวธรรมชาติ',
        price: 75,
        image: '',
        category: 'tea',
        isFavorite: false,
    },
    {
        id: '6',
        name: 'โฮจิฉะลาเต้',
        description: 'ชาโฮจิฉะคั่วหอม ผสมนมอุ่นๆ กลมกล่อม ไม่ขมมาก',
        price: 70,
        image: '',
        category: 'tea',
        isFavorite: true,
    },
];

export const banners: Banner[] = [
    { id: '1', image: '', title: '1st Anniversary! ฉลองครบรอบ 1 ปี' },
    { id: '2', image: '', title: 'เมนูใหม่มาแล้ว! ลองชิมได้เลย' },
    { id: '3', image: '', title: 'สะสมคะแนนแลกของรางวัล' },
];

export const mockAddresses: Address[] = [
    { id: '1', label: 'บ้านพี่', detail: 'หลังสีเขียว' },
    { id: '2', label: 'ออฟฟิศ', detail: 'ชั้น 5 อาคาร A' },
];

export const mockOrders: Order[] = [
    {
        id: 'ORD001',
        items: [
            { menuItem: menuItems[0], quantity: 2 },
            { menuItem: menuItems[2], quantity: 1 },
        ],
        total: 185,
        status: 'done',
        address: mockAddresses[0],
        deliveryFee: 0,
        createdAt: '2026-02-20T10:00:00Z',
    },
];

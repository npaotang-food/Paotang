export type Tier = 'Silver' | 'Gold' | 'Platinum';

export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: Tier;
  avatarInitials: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface MenuItemOption {
  id: string;
  label: string;
  priceAddOn: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isFavorite: boolean;
  options?: {
    label: string;
    items: MenuItemOption[];
  };
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedOption?: MenuItemOption;
  note?: string;
}

export interface Address {
  id: string;
  label: string;
  detail: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'done';
  address: Address;
  deliveryFee: number;
  createdAt: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
}

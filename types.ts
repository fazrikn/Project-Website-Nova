
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Event {
  id: string | number;
  title: string;
  type: string;
  event_date: string;
  event_time: string;
  price: number;
  image_url: string;
  description: string;
}

export interface Ticket {
  id: string;
  event_id: string | number;
  user_id: string;
  status: 'pending' | 'paid';
  quantity: number;
  total_price: number;
  qr_code: string;
  created_at: string;
  event?: Event;
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  image: string;
}

export type ViewState = 'home' | 'about' | 'services' | 'news' | 'events' | 'login' | 'register' | 'dashboard' | 'admin' | 'booking' | 'service-detail';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

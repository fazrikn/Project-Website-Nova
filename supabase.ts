
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { Event, User, Ticket } from './types';

// Environment variables check
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Only initialize if keys are present to prevent "supabaseUrl is required" error
export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

// Mock data for fallback when Supabase is not configured
let mockEvents: Event[] = [
  { id: 1, title: "Future of AI in Education", type: "Seminar", event_date: "2025-05-15", event_time: "09:00", price: 150000, image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=400&h=300&fit=crop", description: "Exploring how artificial intelligence transforms learning environments." },
  { id: 2, title: "Web Development Bootcamp", type: "Workshop", event_date: "2025-05-20", event_time: "13:00", price: 250000, image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&h=300&fit=crop", description: "Intensive workshop on modern front-end technologies." },
  { id: 3, title: "Global Health Conference", type: "Conference", event_date: "2025-06-10", event_time: "08:00", price: 500000, image_url: "https://images.unsplash.com/photo-1505751172107-573220ad4bca?q=80&w=400&h=300&fit=crop", description: "International gathering of health experts and researchers." },
  { id: 4, title: "Digital Marketing 101", type: "Seminar", event_date: "2025-05-05", event_time: "19:00", price: 100000, image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&h=300&fit=crop", description: "Learn the fundamentals of SEO and Social Media Marketing." }
];
let mockTickets: Ticket[] = [];

export const supabaseService = {
  // --- EVENT OPERATIONS ---
  async getEvents(): Promise<Event[]> {
    if (!supabase) {
      console.warn("Supabase not configured. Using mock data.");
      return new Promise(resolve => setTimeout(() => resolve([...mockEvents]), 300));
    }
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (error) throw error;
    return data as Event[];
  },

  async addEvent(event: Omit<Event, 'id'>): Promise<Event> {
    if (!supabase) {
      const newEvent = { ...event, id: Date.now() };
      mockEvents.push(newEvent);
      return newEvent;
    }
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    
    if (error) throw error;
    return data as Event;
  },

  async deleteEvent(id: string | number): Promise<void> {
    if (!supabase) {
      mockEvents = mockEvents.filter(e => e.id !== id);
      return;
    }
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- AUTH OPERATIONS ---
  async login(email: string, password: string): Promise<User | null> {
    if (!supabase) {
      if (email === 'admin@nova.id' && password === 'admin123') {
        return { id: 'admin-1', email, name: 'Administrator', role: 'admin' };
      }
      return { id: 'user-' + Date.now(), email, name: email.split('@')[0], role: 'user' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email!,
      name: profile?.full_name || data.user.email?.split('@')[0],
      role: profile?.role || 'user'
    };
  },

  async register(name: string, email: string, password: string): Promise<User | null> {
    if (!supabase) {
      return { id: 'user-' + Date.now(), email, name, role: 'user' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) throw error;
    return {
      id: data.user?.id || '',
      email: data.user?.email || '',
      name: name,
      role: 'user'
    };
  },

  async logout() {
    if (supabase) await supabase.auth.signOut();
  },

  // --- TICKET OPERATIONS ---
  async createTicket(userId: string, eventId: string | number, quantity: number): Promise<Ticket> {
    if (!supabase) {
      const event = mockEvents.find(e => e.id === eventId);
      const newTicket: Ticket = {
        id: 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user_id: userId,
        event_id: eventId,
        status: 'pending',
        quantity,
        total_price: (event?.price || 0) * quantity,
        qr_code: 'PENDING-' + Date.now(),
        created_at: new Date().toISOString(),
        event: event
      };
      mockTickets.unshift(newTicket);
      return newTicket;
    }

    const { data: event } = await supabase
      .from('events')
      .select('price')
      .eq('id', eventId)
      .single();

    const totalPrice = (event?.price || 0) * quantity;
    const ticketId = 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const { data, error } = await supabase
      .from('tickets')
      .insert([{
        id: ticketId,
        user_id: userId,
        event_id: eventId,
        quantity,
        total_price: totalPrice,
        status: 'pending',
        qr_code: 'PENDING-' + ticketId
      }])
      .select('*, event:events(*)')
      .single();

    if (error) throw error;
    return data as Ticket;
  },

  async getTickets(userId: string): Promise<Ticket[]> {
    if (!supabase) {
      return mockTickets.filter(t => t.user_id === userId);
    }
    const { data, error } = await supabase
      .from('tickets')
      .select('*, event:events(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Ticket[];
  },

  async payTicket(ticketId: string): Promise<void> {
    if (!supabase) {
      const index = mockTickets.findIndex(t => t.id === ticketId);
      if (index > -1) mockTickets[index].status = 'paid';
      return;
    }
    const { error } = await supabase
      .from('tickets')
      .update({ status: 'paid', qr_code: 'PAID-' + ticketId })
      .eq('id', ticketId);

    if (error) throw error;
  }
};

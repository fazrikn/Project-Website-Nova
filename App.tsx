
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, ViewState, Event, Ticket, ToastMessage, Service } from './types';
import { supabaseService } from './supabase';
import { SERVICES_DATA, NEWS_DATA } from './constants';

// --- SHARED UI COMPONENTS ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-zoom-in">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

const Toast: React.FC<{ toasts: ToastMessage[]; removeToast: (id: number) => void }> = ({ toasts, removeToast }) => (
  <div className="fixed bottom-5 right-5 z-[3000] flex flex-col gap-2">
    {toasts.map((toast) => (
      <div 
        key={toast.id}
        className={`min-w-[280px] p-4 bg-white border-l-4 shadow-2xl rounded-xl flex items-center justify-between animate-slide-in-right ${
          toast.type === 'success' ? 'border-green-500' : toast.type === 'error' ? 'border-red-500' : 'border-blue-500'
        }`}
      >
        <span className="text-sm font-bold text-gray-700">{toast.message}</span>
        <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-300 hover:text-gray-500">✕</button>
      </div>
    ))}
  </div>
);

// --- NAVIGATION & FOOTER ---

const Navbar: React.FC<{ user: User | null; currentView: ViewState; setView: (v: ViewState) => void; }> = ({ user, currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'news', label: 'News' },
    { id: 'events', label: 'Events' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-[100] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 text-2xl font-black cursor-pointer group" onClick={() => setView('home')}>
            <div className="bg-orange-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
            </div>
            <span className="text-gray-900 tracking-tighter">NOVA</span>
          </div>

          <button className="md:hidden text-gray-600" onClick={() => setIsOpen(!isOpen)}>
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>

          <ul className={`fixed md:relative top-20 md:top-0 left-0 w-full md:w-auto bg-white md:bg-transparent flex flex-col md:flex-row items-center gap-8 p-8 md:p-0 shadow-xl md:shadow-none transition-all duration-300 ${isOpen ? 'flex' : 'hidden md:flex'}`}>
            {navLinks.map(link => (
              <li key={link.id}>
                <button 
                  onClick={() => { setView(link.id as ViewState); setIsOpen(false); }}
                  className={`text-sm font-bold transition-all uppercase tracking-widest ${currentView === link.id ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
            <li>
              {user ? (
                <button 
                  onClick={() => { setView(user.role === 'admin' ? 'admin' : 'dashboard'); setIsOpen(false); }}
                  className="bg-orange-50 text-orange-600 px-5 py-2 rounded-full font-black text-xs uppercase hover:bg-orange-100 transition-colors"
                >
                  Hi, {user.name.split(' ')[0]}
                </button>
              ) : (
                <button 
                  onClick={() => { setView('login'); setIsOpen(false); }}
                  className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-black text-sm uppercase shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95"
                >
                  Log In
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

const Footer: React.FC<{ setView: (v: ViewState) => void }> = ({ setView }) => (
  <footer className="bg-[#111] text-white py-16 mt-20 border-t-8 border-orange-500">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      <div>
        <div className="text-3xl font-black mb-4 tracking-tighter">NOVA</div>
        <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed uppercase font-medium">Driving Innovation Through University-Industry Engagement.</p>
        <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-orange-500">
          <button onClick={() => setView('about')} className="hover:text-white transition-colors">About Us</button>
          <button className="hover:text-white transition-colors">Privacy Policy</button>
          <button className="hover:text-white transition-colors">Terms of Service</button>
        </div>
      </div>
      <div className="text-left md:text-right">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">&copy; 2025 NOVA Community. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// --- AUTH PAGES ---

const RegisterPage: React.FC<{ setView: (v: ViewState) => void; onRegister: (name: string, email: string, pass: string) => void }> = ({ setView, onRegister }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    onRegister(target.fullname.value, target.email.value, target.password.value);
  };

  return (
    <section className="min-h-[90vh] flex items-center justify-center p-6 bg-gray-50/50">
      <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-100 animate-zoom-in">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Create Account</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bergabunglah dengan NOVA hari ini</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
            <input name="fullname" type="text" required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="Your Name" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
            <input name="email" type="email" required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
            <input name="password" type="password" required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all transform active:scale-95">Register Now</button>
        </form>
        <div className="mt-8 flex items-center gap-4 text-gray-300 font-bold uppercase text-[10px] tracking-widest">
          <div className="h-px bg-gray-100 flex-grow"></div> OR <div className="h-px bg-gray-100 flex-grow"></div>
        </div>
        <button 
          onClick={() => setView('login')}
          className="mt-8 w-full border-2 border-orange-500 text-orange-500 py-4 rounded-2xl font-black text-sm uppercase hover:bg-orange-50 transition-all"
        >
          Sudah punya akun? Log In
        </button>
      </div>
    </section>
  );
};

// --- PAGES & SECTIONS ---

const HomePage: React.FC<{ setView: (v: ViewState) => void; events: Event[] }> = ({ setView, events }) => (
  <div className="animate-fade-in">
    <section className="relative h-[650px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070')] bg-cover bg-fixed bg-center scale-105"></div>
      <div className="relative z-20 max-w-4xl px-6 animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] uppercase tracking-tighter">
          Driving Innovation Through<br /><span className="text-orange-500">University-Industry</span> Engagement
        </h1>
        <p className="text-lg md:text-xl mb-12 text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-wide">
          Membangun masa depan pendidikan dan karir melalui kolaborasi pengetahuan, riset, dan teknologi.
        </p>
        <button 
          onClick={() => setView('events')}
          className="bg-orange-500 text-white px-12 py-4 rounded-2xl text-lg font-black uppercase shadow-2xl shadow-orange-500/50 hover:bg-orange-600 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          Explore Events
        </button>
      </div>
    </section>

    <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
      <div className="bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] p-12 grid grid-cols-1 md:grid-cols-3 gap-12 border border-gray-50">
        <div className="text-center md:border-r border-gray-100">
          <span className="block text-6xl font-black text-orange-500 mb-2">20+</span>
          <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Conferences</span>
        </div>
        <div className="text-center md:border-r border-gray-100">
          <span className="block text-6xl font-black text-orange-500 mb-2">30+</span>
          <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Journals</span>
        </div>
        <div className="text-center">
          <span className="block text-6xl font-black text-orange-500 mb-2">500+</span>
          <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.3em]">Members</span>
        </div>
      </div>
    </div>

    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-2">Upcoming Events</h2>
          <p className="text-gray-400 font-bold text-lg">Jangan lewatkan kesempatan untuk belajar dari ahlinya</p>
        </div>
        <button onClick={() => setView('events')} className="text-orange-500 font-black uppercase text-xs tracking-widest border-b-2 border-orange-500 pb-1 hover:text-orange-600 transition-colors">Lihat Semua Event</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {events.slice(0, 3).map((event) => (
          <EventCard key={event.id} event={event} onDetail={() => setView('events')} />
        ))}
      </div>
    </section>
  </div>
);

const EventCard: React.FC<{ event: Event; onDetail: () => void }> = ({ event, onDetail }) => {
  const d = new Date(event.event_date);
  const day = d.getDate();
  const month = d.toLocaleString('id-ID', { month: 'short' }).toUpperCase();

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all group border border-gray-100 animate-slide-up">
      <div className="relative h-64 overflow-hidden">
        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 text-center shadow-lg border border-gray-100">
          <span className="block text-[10px] text-orange-500 font-black leading-tight mb-0.5">{month}</span>
          <span className="text-2xl font-black text-gray-800 leading-tight">{day}</span>
        </div>
        <div className="absolute top-4 right-4 bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-xl uppercase tracking-[0.2em] backdrop-blur-sm">
          {event.type}
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight min-h-[4rem] group-hover:text-orange-500 transition-colors">{event.title}</h3>
        <div className="text-xs text-gray-400 mb-8 font-black uppercase tracking-widest flex items-center gap-2">
          <span className="bg-gray-100 p-1.5 rounded-lg">🕒</span> {event.event_time} WIB
        </div>
        <div className="flex justify-between items-center border-t border-gray-100 pt-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tiket Mulai</span>
            <span className="text-2xl font-black text-orange-500">
              Rp {event.price.toLocaleString('id-ID')}
            </span>
          </div>
          <button 
            onClick={onDetail}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 hover:bg-orange-500 transition-all active:scale-95"
          >
            Detail Program
          </button>
        </div>
      </div>
    </div>
  );
};

const ContactSection: React.FC = () => (
  <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
    <div className="animate-slide-up">
      <h3 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4">Contact Information</h3>
      <p className="text-gray-500 mb-10 font-medium leading-relaxed">Hubungi kami untuk informasi lebih lanjut mengenai layanan atau event yang tersedia.</p>
      
      <div className="space-y-10">
        <div className="flex items-start gap-6">
          <div className="bg-red-50 p-4 rounded-2xl text-red-500 text-2xl">📍</div>
          <div>
            <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest mb-1">Our Address</h4>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Nagrak Sari, Kec. Nagrak, Kabupaten Sukabumi, Jawa Barat</p>
          </div>
        </div>
        <div className="flex items-start gap-6">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-500 text-2xl">✉️</div>
          <div>
            <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest mb-1">Email Us</h4>
            <p className="text-sm text-gray-500 font-medium">fazriki18@gmail.com</p>
          </div>
        </div>
        <div className="flex items-start gap-6">
          <div className="bg-green-50 p-4 rounded-2xl text-green-500 text-2xl">📞</div>
          <div>
            <h4 className="font-black text-gray-800 uppercase text-xs tracking-widest mb-1">Call Us</h4>
            <p className="text-sm text-gray-500 font-medium">+62 877 7099 1405</p>
          </div>
        </div>
      </div>

      <div className="mt-12 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white grayscale hover:grayscale-0 transition-all duration-500">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.6757134372555!2d106.8164!3d-6.9147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6849419b4b0000%3A0x0!2zNsKwNTQnNTIuOSJTIDEwNsKwNDgnNTkuMCJF!5e0!3m2!1sen!2sid!4v1700000000000" 
          width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
        ></iframe>
      </div>
    </div>

    <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter mb-8">Send us a Message</h3>
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Nama Lengkap</label>
            <input type="text" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="Masukkan nama Anda" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Email Address</label>
            <input type="email" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="contoh@email.com" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Subject</label>
          <select className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-700">
            <option>Pertanyaan Umum</option>
            <option>Info Event</option>
            <option>Partnership</option>
            <option>Lainnya</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Pesan</label>
          <textarea className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-700 h-32" placeholder="Tulis pesan Anda di sini..."></textarea>
        </div>
        <button type="button" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-gray-900/20 hover:bg-orange-500 transition-all active:scale-95">Send Message</button>
      </form>
    </div>
  </div>
);

// --- MAIN APP ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [events, setEvents] = useState<Event[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  // Modal states
  const [selectedEventForCheckout, setSelectedEventForCheckout] = useState<Event | null>(null);
  const [selectedTicketForInvoice, setSelectedTicketForInvoice] = useState<Ticket | null>(null);
  const [selectedTicketForPayment, setSelectedTicketForPayment] = useState<Ticket | null>(null);
  const [paymentStep, setPaymentStep] = useState<'methods' | 'bank' | 'wallet' | 'qris'>('methods');
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  // SelectedServiceId state
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const data = await supabaseService.getEvents();
      setEvents(data);
      const savedUser = localStorage.getItem('nova_user');
      if (savedUser) {
        const u = JSON.parse(savedUser) as User;
        setUser(u);
        const t = await supabaseService.getTickets(u.id);
        setTickets(t);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const loggedUser = await supabaseService.login(email, password);
    if (loggedUser) {
      setUser(loggedUser);
      localStorage.setItem('nova_user', JSON.stringify(loggedUser));
      const t = await supabaseService.getTickets(loggedUser.id);
      setTickets(t);
      showToast(`Selamat datang, ${loggedUser.name}!`, 'success');
      setView(loggedUser.role === 'admin' ? 'admin' : 'home');
    } else {
      showToast('Email atau password salah', 'error');
    }
  };

  const handleRegister = async (name: string, email: string, pass: string) => {
    const newUser = await supabaseService.register(name, email, pass);
    if (newUser) {
      showToast('Registrasi Berhasil! Silakan login.', 'success');
      setView('login');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTickets([]);
    localStorage.removeItem('nova_user');
    showToast('Anda telah logout', 'info');
    setView('home');
  };

  const filteredEvents = useMemo(() => {
    if (filter === 'All') return events;
    return events.filter(e => e.type === filter);
  }, [events, filter]);

  const handleCheckout = async (quantity: number) => {
    if (selectedEventForCheckout && user) {
      const ticket = await supabaseService.createTicket(user.id, selectedEventForCheckout.id, quantity);
      setTickets(prev => [ticket, ...prev]);
      showToast('Berhasil menambahkan tiket ke keranjang!', 'success');
      setSelectedEventForCheckout(null);
      setView('dashboard');
    }
  };

  const confirmPayment = async (ticketId: string) => {
    await supabaseService.payTicket(ticketId);
    if (user) {
      const t = await supabaseService.getTickets(user.id);
      setTickets(t);
    }
    showToast('Pembayaran berhasil dikonfirmasi!', 'success');
    setSelectedTicketForPayment(null);
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-8 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-sm font-black text-orange-500 uppercase tracking-[0.5em] animate-pulse">LOADING NOVA</p>
        </div>
      </div>
    );

    switch (view) {
      case 'home': return <HomePage setView={setView} events={events} />;
      case 'about':
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
               <div>
                 <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-8 leading-tight">Tentang NOVA</h2>
                 <p className="text-lg text-gray-500 font-medium leading-relaxed mb-6">NOVA adalah platform edukasi terdepan yang menghubungkan universitas, industri, dan masyarakat secara global.</p>
                 <p className="text-gray-500 leading-relaxed font-medium">Visi kami adalah menciptakan ekosistem belajar yang berkelanjutan and inovatif. Melalui seminar, webinar, and konferensi, kami berkomitmen meningkatkan employability dan wawasan global para profesional muda.</p>
               </div>
               <div className="grid grid-cols-2 gap-4 h-[400px]">
                  <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400" className="w-full h-full object-cover rounded-3xl" alt="about 1" />
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400" className="w-full h-full object-cover rounded-3xl mt-12" alt="about 2" />
               </div>
             </div>
             <ContactSection />
          </section>
        );
      case 'services':
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
             <h2 className="text-5xl font-black text-center text-gray-900 uppercase tracking-tighter mb-4">Layanan Kami</h2>
             <p className="text-gray-400 text-center font-bold text-lg mb-20 uppercase tracking-widest">Solusi lengkap untuk kebutuhan akademik dan profesional Anda</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {SERVICES_DATA.map(s => (
                 <div key={s.id} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl hover:shadow-2xl transition-all group">
                   <div className="text-6xl mb-8 group-hover:scale-110 transition-transform">{s.icon}</div>
                   <h3 className="text-2xl font-black mb-4 tracking-tight">{s.title}</h3>
                   <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">{s.shortDesc}</p>
                   <button 
                     onClick={() => { setSelectedServiceId(s.id); setView('service-detail'); }}
                     className="text-[10px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-2"
                   >
                     Detail Program →
                   </button>
                 </div>
               ))}
             </div>
             <div className="blue-gradient rounded-[3rem] p-16 mt-32 text-white text-center shadow-3xl relative overflow-hidden">
                <div className="relative z-10 animate-slide-up">
                  <h2 className="text-5xl font-black mb-8 tracking-tighter uppercase">Let's Build the Future Together</h2>
                  <p className="text-xl text-blue-100/80 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">Ready to make an impact? Connect with us to explore collaboration opportunities, publish your work, or join our community.</p>
                  <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <a href="https://wa.me/6287770991405" target="_blank" className="bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl">
                      Contact Us On WhatsApp
                    </a>
                    <button className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">
                      Propose a Collaboration
                    </button>
                  </div>
                </div>
             </div>
          </section>
        );
      case 'news':
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in text-center">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-16">Latest News & Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {NEWS_DATA.map((news, idx) => (
                <div key={idx} className="bg-white p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-gray-50 flex flex-col animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-6 block">{news.date}</span>
                  <h3 className="text-2xl font-black text-gray-800 leading-tight mb-6">{news.title}</h3>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed">{news.desc}</p>
                </div>
              ))}
            </div>
          </section>
        );
      case 'events': 
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
            <h2 className="text-6xl font-black text-center text-gray-900 uppercase tracking-tighter mb-4">Explore Events</h2>
            <p className="text-gray-400 text-center font-bold text-lg mb-12">Temukan seminar dan webinar yang sesuai dengan minat Anda</p>
            
            <div className="flex justify-center gap-4 mb-16 overflow-x-auto pb-4 px-2">
              {['All', 'Seminar', 'Workshop', 'Conference'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-orange-500 text-white shadow-xl shadow-orange-500/30' : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-500 hover:text-orange-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                <p className="text-gray-400 font-black uppercase tracking-widest">Tidak ada event dalam kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    onDetail={() => {
                      if (!user) {
                        showToast('Silakan login terlebih dahulu', 'info');
                        setView('login');
                        return;
                      }
                      setSelectedEventForCheckout(event);
                    }} 
                  />
                ))}
              </div>
            )}
          </section>
        );
      case 'login':
        return (
          <section className="min-h-[90vh] flex items-center justify-center p-6 bg-gray-50/50">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-100 animate-zoom-in">
              <h2 className="text-3xl font-black text-center mb-10 text-gray-800 tracking-tight">Welcome Back</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                  <input name="email" type="email" required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="user@nova.id atau admin@nova.id" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
                  <input name="password" type="password" required className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold text-gray-700" placeholder="******" />
                </div>
                <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all transform active:scale-95">Sign In</button>
              </form>
              <div className="mt-8 flex items-center gap-4 text-gray-300 font-bold uppercase text-[10px] tracking-widest">
                <div className="h-px bg-gray-100 flex-grow"></div> OR <div className="h-px bg-gray-100 flex-grow"></div>
              </div>
              <button 
                onClick={() => setView('register')}
                className="mt-8 w-full border-2 border-orange-500 text-orange-500 py-4 rounded-2xl font-black text-sm uppercase hover:bg-orange-50 transition-all"
              >
                Don't have an account? Register
              </button>
              <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hint: Gunakan <b>admin@nova.id</b> untuk akses Admin.</p>
            </div>
          </section>
        );
      case 'register':
        return <RegisterPage setView={setView} onRegister={handleRegister} />;
      case 'dashboard':
        return user ? (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
            <h2 className="text-6xl font-black text-gray-900 uppercase tracking-tighter mb-16">Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-3xl mb-4 text-orange-500">👤</div>
                  <h4 className="font-black text-gray-800 text-xl tracking-tight">{user.name}</h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{user.email}</p>
                  <button onClick={() => setFilter('All')} className="w-full bg-orange-50 text-orange-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest mb-3 hover:bg-orange-100 transition-all">My Tickets</button>
                  <button onClick={handleLogout} className="w-full text-red-500 font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-red-50 transition-all">Logout</button>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-50 min-h-[500px]">
                  <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-12">Tiket Saya</h3>
                  {tickets.length === 0 ? (
                    <div className="text-center py-32 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                      <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-6">Belum ada tiket.</p>
                      <button onClick={() => setView('events')} className="text-orange-500 font-black text-[10px] uppercase tracking-widest border-2 border-orange-500 px-6 py-3 rounded-xl hover:bg-orange-50 transition-all">Cari Event</button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {tickets.map(t => (
                        <div key={t.id} className="group relative flex flex-col md:flex-row gap-8 p-8 border-2 border-dashed border-gray-100 rounded-[2.5rem] hover:border-orange-500/30 transition-all">
                          <div className="md:w-32 flex flex-col items-center justify-center shrink-0">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 group-hover:border-orange-100 transition-colors">
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.qr_code}`} 
                                alt="QR" 
                                className={`w-24 h-24 ${t.status === 'pending' ? 'grayscale opacity-20' : ''}`}
                              />
                            </div>
                            <span className="mt-4 text-[8px] font-mono text-gray-400 uppercase tracking-widest">{t.id}</span>
                          </div>
                          <div className="flex-grow">
                             <h4 className="text-2xl font-black text-gray-800 mb-2 leading-tight group-hover:text-orange-500 transition-colors">{t.event?.title}</h4>
                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t.event?.event_date} | {t.event?.event_time} WIB</p>
                             <div className="flex flex-wrap items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                  {t.status === 'paid' ? 'PAID' : 'UNPAID'}
                                </span>
                                {t.status === 'pending' && (
                                  <button 
                                    onClick={() => setSelectedTicketForInvoice(t)}
                                    className="bg-blue-500 text-white px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                                  >
                                    Invoice
                                  </button>
                                )}
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null;
      case 'admin':
        return user?.role === 'admin' ? (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in flex flex-col lg:flex-row gap-12">
             <div className="lg:w-64 shrink-0 bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 h-fit">
               <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-8">Navigation</h4>
               <ul className="space-y-4">
                 <li className="bg-orange-50 text-orange-600 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3">
                   <span className="text-xl">📊</span> Management Event
                 </li>
                 <li onClick={handleLogout} className="text-red-500 p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:bg-red-50 transition-colors">
                   <span className="text-xl">🚪</span> Logout
                 </li>
               </ul>
             </div>
             <div className="flex-grow">
               <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Admin Dashboard</h2>
                    <button className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all">
                      + Tambah Event
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-gray-300 uppercase tracking-widest border-b border-gray-100">
                          <th className="px-6 py-4">No</th>
                          <th className="px-6 py-4">Judul</th>
                          <th className="px-6 py-4">Tipe</th>
                          <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {events.map((e, i) => (
                          <tr key={e.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-6 text-sm font-bold text-gray-400">{i + 1}</td>
                            <td className="px-6 py-6 font-black text-gray-800 tracking-tight">{e.title}</td>
                            <td className="px-6 py-6 text-xs font-black text-orange-500 uppercase tracking-widest">{e.type}</td>
                            <td className="px-6 py-6 text-center">
                              <button className="bg-red-500 text-white px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             </div>
          </section>
        ) : null;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar user={user} currentView={view} setView={setView} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer setView={setView} />
      <Toast toasts={toasts} removeToast={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* MODALS */}
      <Modal 
        isOpen={!!selectedEventForCheckout} 
        onClose={() => setSelectedEventForCheckout(null)}
        title="Checkout"
      >
        <div className="space-y-8 text-center md:text-left">
          <div className="animate-slide-up">
            <h4 className="text-2xl font-black text-gray-900 leading-tight mb-2 tracking-tight">{selectedEventForCheckout?.title}</h4>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{selectedEventForCheckout?.type} | {selectedEventForCheckout?.event_date}</p>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Peserta</label>
              <input type="text" readOnly value={user?.name} className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold text-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input type="text" readOnly value={user?.email} className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none font-bold text-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah Tiket</label>
              <input id="ticket-qty" type="number" defaultValue={1} min={1} className="w-full border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-orange-500 font-bold text-gray-700" />
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleCheckout(parseInt((document.getElementById('ticket-qty') as HTMLInputElement).value) || 1)}
              className="flex-grow bg-orange-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95"
            >
              Add to Cart
            </button>
            <button onClick={() => setSelectedEventForCheckout(null)} className="px-8 border-2 border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-colors">Batal</button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedTicketForInvoice} 
        onClose={() => setSelectedTicketForInvoice(null)}
        title="Invoice"
      >
        <div className="space-y-10">
          <div className="text-center animate-slide-up">
            <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Invoice</h4>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Silakan selesaikan pembayaran</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-[2rem] space-y-4 border border-gray-100 font-bold text-sm">
            <div className="flex justify-between items-center text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-200 pb-3 mb-4">
              <span>Detail Transaksi</span>
              <span>#{selectedTicketForInvoice?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[10px] tracking-widest">Event</span>
              <span className="text-gray-800 text-right">{selectedTicketForInvoice?.event?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[10px] tracking-widest">Date</span>
              <span className="text-gray-800">{selectedTicketForInvoice?.event?.event_date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 uppercase text-[10px] tracking-widest">Quantity</span>
              <span className="text-gray-800">{selectedTicketForInvoice?.quantity}x</span>
            </div>
            <div className="flex justify-between pt-6 border-t-2 border-dashed border-gray-200">
              <span className="text-gray-400 font-black uppercase text-xs tracking-widest">Total Tagihan</span>
              <span className="text-2xl font-black text-orange-500">Rp {selectedTicketForInvoice?.total_price.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setSelectedTicketForPayment(selectedTicketForInvoice);
                setSelectedTicketForInvoice(null);
                setPaymentStep('methods');
              }}
              className="flex-grow bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
            >
              Payment
            </button>
            <button onClick={() => setSelectedTicketForInvoice(null)} className="px-10 border-2 border-gray-100 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50">Batal</button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedTicketForPayment} 
        onClose={() => setSelectedTicketForPayment(null)}
        title="Pay Now"
      >
        <div className="space-y-10 text-center animate-fade-in">
          <div>
             <h4 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Pay Now</h4>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pilih metode pembayaran</p>
          </div>

          {paymentStep === 'methods' && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'bank', icon: '🏦', label: 'Transfer Bank' },
                { id: 'wallet', icon: '📱', label: 'E-Wallet' },
                { id: 'qris', icon: '🔳', label: 'QRIS' }
              ].map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setPaymentStep(m.id as any)}
                  className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 hover:border-orange-500 transition-all group"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{m.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">{m.label}</span>
                </button>
              ))}
            </div>
          )}

          {paymentStep === 'bank' && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 {['BCA', 'Mandiri', 'BNI', 'BRI'].map(bank => (
                   <button 
                     key={bank} 
                     onClick={() => setSelectedBank(bank)}
                     className={`p-4 rounded-xl border-2 transition-all font-black uppercase text-xs tracking-widest ${selectedBank === bank ? 'bg-orange-500 text-white border-orange-500 shadow-xl' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                   >
                     {bank}
                   </button>
                 ))}
               </div>
               {selectedBank && (
                 <div className="bg-orange-50 p-8 rounded-3xl animate-slide-up">
                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">{selectedBank} Virtual Account</p>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">9037-0100-5000</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">a.n NOVA Community</p>
                 </div>
               )}
               <div className="flex gap-4">
                 <button onClick={() => { setPaymentStep('methods'); setSelectedBank(''); }} className="flex-grow border-2 border-gray-100 p-4 rounded-2xl font-black text-xs uppercase text-gray-400">Kembali</button>
                 {selectedBank && (
                    <button onClick={() => confirmPayment(selectedTicketForPayment!.id)} className="flex-grow bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Pay Now</button>
                 )}
               </div>
            </div>
          )}

          {paymentStep === 'wallet' && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 {['GoPay', 'DANA', 'OVO', 'ShopeePay'].map(w => (
                   <button 
                     key={w} 
                     onClick={() => setSelectedWallet(w)}
                     className={`p-4 rounded-xl border-2 transition-all font-black uppercase text-xs tracking-widest ${selectedWallet === w ? 'bg-orange-500 text-white border-orange-500 shadow-xl' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                   >
                     {w}
                   </button>
                 ))}
               </div>
               {selectedWallet && (
                 <div className="bg-orange-50 p-8 rounded-3xl animate-slide-up">
                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-2">{selectedWallet} Number</p>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">0812-3456-7890</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">a.n NOVA Community</p>
                 </div>
               )}
               <div className="flex gap-4">
                 <button onClick={() => { setPaymentStep('methods'); setSelectedWallet(''); }} className="flex-grow border-2 border-gray-100 p-4 rounded-2xl font-black text-xs uppercase text-gray-400">Kembali</button>
                 {selectedWallet && (
                    <button onClick={() => confirmPayment(selectedTicketForPayment!.id)} className="flex-grow bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Pay Now</button>
                 )}
               </div>
            </div>
          )}

          {paymentStep === 'qris' && (
            <div className="space-y-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-3xl shadow-2xl border-4 border-orange-500/20 group">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedTicketForPayment?.id}`} 
                  className="w-56 h-56 rounded-xl group-hover:scale-105 transition-transform"
                  alt="QRIS" 
                />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scan QR di atas untuk membayar</p>
              <div className="flex gap-4 w-full">
                <button onClick={() => setPaymentStep('methods')} className="flex-grow border-2 border-gray-100 p-4 rounded-2xl font-black text-xs uppercase text-gray-400">Kembali</button>
                <button onClick={() => confirmPayment(selectedTicketForPayment!.id)} className="flex-grow bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Pay Now</button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default App;

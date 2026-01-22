
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
        <div className="p-8 max-h-[85vh] overflow-y-auto">{children}</div>
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
                <div className="flex items-center gap-2">
                   {user.role === 'admin' && (
                     <button 
                       onClick={() => setView('admin')}
                       className="text-[9px] font-black uppercase text-gray-400 hover:text-orange-500 transition-colors mr-2"
                     >
                       Admin Panel
                     </button>
                   )}
                   <button 
                    onClick={() => { setView(user.role === 'admin' ? 'admin' : 'dashboard'); setIsOpen(false); }}
                    className="bg-orange-50 text-orange-600 px-5 py-2 rounded-full font-black text-xs uppercase hover:bg-orange-100 transition-colors"
                  >
                    Hi, {user.name.split(' ')[0]}
                  </button>
                </div>
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
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
      <div>
        <div className="text-3xl font-black mb-4 tracking-tighter">NOVA</div>
        <p className="text-gray-400 mb-8 max-w-md text-sm leading-relaxed uppercase font-medium mx-auto md:mx-0">Driving Innovation Through University-Industry Engagement.</p>
        <div className="flex justify-center md:justify-start gap-8 text-xs font-black uppercase tracking-widest text-orange-500">
          <button onClick={() => setView('about')} className="hover:text-white transition-colors">About Us</button>
          <button className="hover:text-white transition-colors">Privacy Policy</button>
          <button className="hover:text-white transition-colors">Terms</button>
        </div>
      </div>
      <div className="text-center md:text-right">
        <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">&copy; 2025 NOVA Community. All rights reserved.</p>
      </div>
    </div>
  </footer>
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
  const [showAddEventForm, setShowAddEventForm] = useState(false);

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
      showToast('Berhasil menambahkan tiket!', 'success');
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
    showToast('Pembayaran berhasil!', 'success');
    setSelectedTicketForPayment(null);
  };

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newEvent = {
      title: (form.elements.namedItem('title') as HTMLInputElement).value,
      type: (form.elements.namedItem('type') as HTMLSelectElement).value,
      event_date: (form.elements.namedItem('date') as HTMLInputElement).value,
      event_time: (form.elements.namedItem('time') as HTMLInputElement).value,
      price: parseFloat((form.elements.namedItem('price') as HTMLInputElement).value),
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      image_url: `https://picsum.photos/seed/${Date.now()}/400/300`
    };

    try {
      const added = await supabaseService.addEvent(newEvent);
      setEvents(prev => [...prev, added]);
      showToast('Event berhasil ditambahkan!', 'success');
      setShowAddEventForm(false);
    } catch (err) {
      showToast('Gagal menambahkan event', 'error');
    }
  };

  const handleDeleteEvent = async (id: string | number) => {
    if (window.confirm('Hapus event ini?')) {
      await supabaseService.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      showToast('Event berhasil dihapus', 'info');
    }
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
      case 'home': return (
        <div className="animate-fade-in">
          <section className="relative h-[600px] flex items-center justify-center text-center text-white overflow-hidden bg-black">
            <div className="absolute inset-0 bg-black/60 z-10"></div>
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105" alt="hero" />
            <div className="relative z-20 max-w-4xl px-6 animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-black mb-8 leading-tight uppercase tracking-tighter">
                DRIVING INNOVATION THROUGH<br /><span className="text-orange-500">UNIVERSITY-INDUSTRY ENGAGEMENT</span>
              </h1>
              <p className="text-sm md:text-lg mb-10 text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
                Membangun masa depan pendidikan dan karir melalui kolaborasi pengetahuan, riset, dan teknologi.
              </p>
              <button 
                onClick={() => setView('events')}
                className="bg-orange-500 text-white px-10 py-4 rounded-xl text-sm font-black uppercase shadow-2xl shadow-orange-500/50 hover:bg-orange-600 transition-all transform active:scale-95"
              >
                Explore Events
              </button>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
            <div className="bg-white rounded-3xl shadow-3xl p-10 grid grid-cols-1 md:grid-cols-3 gap-8 border border-gray-50">
              <div className="text-center md:border-r border-gray-100 p-4">
                <span className="block text-5xl font-black text-orange-500 mb-2">20+</span>
                <span className="text-gray-400 font-black uppercase text-[9px] tracking-[0.3em]">Conferences</span>
              </div>
              <div className="text-center md:border-r border-gray-100 p-4">
                <span className="block text-5xl font-black text-orange-500 mb-2">30+</span>
                <span className="text-gray-400 font-black uppercase text-[9px] tracking-[0.3em]">Journals</span>
              </div>
              <div className="text-center p-4">
                <span className="block text-5xl font-black text-orange-500 mb-2">500+</span>
                <span className="text-gray-400 font-black uppercase text-[9px] tracking-[0.3em]">Members</span>
              </div>
            </div>
          </div>

          <section className="max-w-7xl mx-auto px-6 py-24 text-center">
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">Upcoming Events</h2>
            <p className="text-gray-400 font-bold mb-16 uppercase text-sm tracking-widest">Jangan lewatkan kesempatan untuk belajar dari ahlinya</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {events.slice(0, 3).map(e => (
                <div key={e.id} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 text-left group">
                  <div className="h-48 relative overflow-hidden">
                    <img src={e.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={e.title} />
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg text-[9px] font-black text-orange-500 uppercase tracking-widest">{e.type}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-xl mb-4 h-14 overflow-hidden leading-tight">{e.title}</h3>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="font-black text-orange-500">Rp {e.price.toLocaleString('id-ID')}</span>
                      <button onClick={() => setView('events')} className="bg-gray-900 text-white px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Detail</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      );
      case 'about':
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-8">Tentang <span className="text-orange-500">NOVA</span></h2>
                <div className="space-y-6 text-gray-500 font-medium leading-relaxed">
                  <p>NOVA adalah platform kolaborasi antara universitas dan industri yang berfokus pada inovasi, pendidikan, dan pengembangan riset terapan.</p>
                  <p>Misi kami adalah menjembatani kesenjangan antara akademisi dan kebutuhan industri melalui program-program strategis seperti seminar, workshop, dan konferensi internasional.</p>
                  <p>Dengan jaringan lebih dari 500 anggota dan berbagai mitra institusional, kami berkomitmen untuk menciptakan ekosistem belajar yang berkelanjutan dan berdampak global.</p>
                </div>
                <button onClick={() => setView('events')} className="mt-10 bg-orange-500 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-orange-500/30">Mulai Kolaborasi</button>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-2xl relative">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471" className="w-full h-full object-cover" alt="about" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
              </div>
            </div>
          </section>
        );
      case 'services':
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in text-center">
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4">Layanan Kami</h2>
            <p className="text-gray-400 font-bold text-sm mb-16 uppercase tracking-widest">Solusi lengkap untuk kebutuhan akademik dan industri</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {SERVICES_DATA.map(service => (
                <div key={service.id} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 hover:shadow-2xl transition-all group text-left flex flex-col">
                  <div className="text-4xl mb-6 bg-orange-50 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-colors">{service.icon}</div>
                  <h3 className="text-xl font-black mb-4 text-gray-800 uppercase">{service.title}</h3>
                  <p className="text-sm text-gray-400 font-medium mb-8 flex-grow">{service.shortDesc}</p>
                  <button onClick={() => showToast('Detail layanan akan segera hadir!', 'info')} className="bg-gray-50 text-gray-600 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest group-hover:bg-orange-500 group-hover:text-white transition-colors">Lihat Detail</button>
                </div>
              ))}
            </div>
          </section>
        );
      case 'news':
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4">Berita Terbaru</h2>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Kabar terbaru dari ekosistem NOVA</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {NEWS_DATA.map((news, idx) => (
                <article key={idx} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-50 flex flex-col">
                  <div className="h-48 bg-gray-200">
                    <img src={`https://picsum.photos/seed/news${idx}/800/600`} className="w-full h-full object-cover" alt="news" />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-4">{news.date}</span>
                    <h3 className="text-xl font-black mb-4 text-gray-800 leading-tight h-14 overflow-hidden">{news.title}</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2">{news.desc}</p>
                    <button className="mt-auto text-orange-500 font-black text-[9px] uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">Baca Selengkapnya <span>→</span></button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      case 'events': 
        return (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in text-center">
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-4">Explore Events</h2>
            <p className="text-gray-400 font-bold text-sm mb-12 uppercase tracking-widest">Temukan seminar dan webinar yang sesuai dengan minat Anda</p>
            
            <div className="flex justify-center gap-3 mb-16 flex-wrap">
              {['All', 'Seminar', 'Workshop', 'Conference'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === cat ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-500'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 text-left flex flex-col">
                  <div className="h-40 relative">
                    <img src={event.image_url} className="w-full h-full object-cover" alt={event.title} />
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 rounded text-[8px] font-black text-orange-500 uppercase">{event.type}</div>
                  </div>
                  <div className="p-5 flex-grow">
                    <h3 className="font-black text-base mb-2 leading-tight h-10 overflow-hidden">{event.title}</h3>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-4">🕒 {event.event_time} WIB</p>
                    <div className="flex justify-between items-center mt-auto">
                       <span className="font-black text-orange-500 text-sm">Rp {event.price.toLocaleString('id-ID')}</span>
                       <button 
                        onClick={() => {
                          if (!user) { showToast('Login dulu yuk!', 'info'); setView('login'); return; }
                          setSelectedEventForCheckout(event);
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase"
                       >
                         Detail Program
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case 'login':
        return (
          <section className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
            <div className="bg-white p-10 rounded-3xl shadow-3xl w-full max-w-md border border-gray-100 animate-zoom-in">
              <h2 className="text-2xl font-black text-center mb-8 text-gray-800 uppercase tracking-widest">Welcome Back</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-orange-500 font-medium text-gray-900 placeholder:text-gray-400 transition-all" 
                    placeholder="user@nova.id atau admin@nova.id" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-orange-500 font-medium text-gray-900 placeholder:text-gray-400 transition-all" 
                    placeholder="******" 
                  />
                </div>
                <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-xl font-black text-sm uppercase shadow-xl hover:bg-orange-600 active:scale-95 transition-all">Sign In</button>
              </form>
              <div className="mt-8 flex items-center gap-4 text-gray-300 font-black uppercase text-[9px] tracking-widest">
                <div className="h-px bg-gray-100 flex-grow"></div> OR <div className="h-px bg-gray-100 flex-grow"></div>
              </div>
              <button 
                onClick={() => setView('register')}
                className="mt-8 w-full bg-red-500 text-white py-4 rounded-xl font-black text-sm uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                Don't have an account? Register
              </button>
              <p className="mt-6 text-[10px] text-gray-400 text-center font-medium">Hint: Gunakan <span className="font-bold">admin@nova.id</span> untuk akses Admin.</p>
            </div>
          </section>
        );
      case 'register':
        return (
          <section className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50">
            <div className="bg-white p-10 rounded-3xl shadow-3xl w-full max-w-md border border-gray-100 animate-zoom-in">
              <h2 className="text-2xl font-black text-center mb-8 text-gray-800 uppercase tracking-widest">Create Account</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget;
                handleRegister(f.fullname.value, f.email.value, f.password.value);
              }} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
                  <input 
                    name="fullname" 
                    type="text" 
                    required 
                    className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-orange-500 font-medium text-gray-900 placeholder:text-gray-400 transition-all" 
                    placeholder="Nama Lengkap" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-orange-500 font-medium text-gray-900 placeholder:text-gray-400 transition-all" 
                    placeholder="email@example.com" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none focus:border-orange-500 font-medium text-gray-900 placeholder:text-gray-400 transition-all" 
                    placeholder="••••••••" 
                  />
                </div>
                <button type="submit" className="w-full bg-orange-500 text-white py-4 rounded-xl font-black text-sm uppercase shadow-xl hover:bg-orange-600 active:scale-95 transition-all">Register</button>
              </form>
              <div className="mt-6 flex items-center gap-4 text-gray-300 font-black uppercase text-[9px] tracking-widest">
                <div className="h-px bg-gray-100 flex-grow"></div> OR <div className="h-px bg-gray-100 flex-grow"></div>
              </div>
              <button 
                onClick={() => setView('login')} 
                className="mt-6 w-full border-2 border-orange-500 text-orange-500 py-3.5 rounded-xl font-black text-sm uppercase hover:bg-orange-50 transition-all"
              >
                Already have an account? Log In
              </button>
            </div>
          </section>
        );
      case 'dashboard':
        return user ? (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in">
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-16 text-center">Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto flex items-center justify-center text-2xl text-orange-500 mb-4">👤</div>
                <h4 className="font-black text-gray-800 text-lg">{user.name}</h4>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-8">{user.email}</p>
                <button className="w-full bg-orange-50 text-orange-600 px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest mb-2">📁 My Tickets</button>
                <button onClick={handleLogout} className="w-full text-red-500 font-black text-[9px] uppercase tracking-widest py-3 hover:bg-red-50 rounded-xl">Logout</button>
              </div>
              <div className="lg:col-span-3 bg-white p-10 rounded-3xl shadow-xl border border-gray-50 min-h-[400px]">
                <h3 className="text-2xl font-black mb-10 text-gray-800">Tiket Saya</h3>
                {tickets.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-gray-300 font-black uppercase text-[10px] tracking-widest">Belum ada tiket.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {tickets.map(t => (
                      <div key={t.id} className="p-6 border border-gray-100 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${t.qr_code}`} className={`w-20 h-20 ${t.status === 'pending' ? 'opacity-20 grayscale' : ''}`} alt="QR" />
                        </div>
                        <div className="flex-grow text-center md:text-left">
                           <h4 className="font-black text-lg text-gray-800 mb-1">{t.event?.title}</h4>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">INV ID: {t.id}</p>
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Status: <span className={t.status === 'paid' ? 'text-green-500' : 'text-red-500'}>{t.status.toUpperCase()}</span></p>
                        </div>
                        {t.status === 'pending' && (
                          <button 
                            onClick={() => setSelectedTicketForInvoice(t)}
                            className="bg-blue-500 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                          >
                            Invoice
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        ) : null;
      case 'admin':
        return user?.role === 'admin' ? (
          <section className="max-w-7xl mx-auto px-6 py-24 animate-fade-in text-center">
            <h2 className="text-5xl font-black text-gray-900 uppercase tracking-tighter mb-16">Admin Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
               <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-50 flex flex-col gap-4">
                 <button className="bg-orange-50 text-orange-600 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">📊 Manajemen Event</button>
                 <button onClick={handleLogout} className="text-red-500 p-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 transition-colors">Logout</button>
               </div>
               <div className="lg:col-span-3 bg-white p-10 rounded-3xl shadow-xl border border-gray-50 text-left">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black text-gray-800">Daftar Event</h3>
                    <button onClick={() => setShowAddEventForm(!showAddEventForm)} className="bg-orange-500 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg shadow-orange-500/20">+ Tambah Event</button>
                  </div>

                  {showAddEventForm && (
                    <div className="mb-12 p-8 bg-gray-50 rounded-2xl border border-gray-100 animate-slide-up">
                      <h4 className="font-black mb-6 uppercase text-xs tracking-widest">Tambah Event Baru</h4>
                      <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="title" required placeholder="Judul Event" className="p-4 rounded-xl border border-gray-200 outline-none text-sm font-bold bg-white text-gray-900" />
                        <select name="type" className="p-4 rounded-xl border border-gray-200 outline-none text-sm font-bold bg-white text-gray-900">
                          <option>Seminar</option>
                          <option>Workshop</option>
                          <option>Conference</option>
                        </select>
                        <input name="date" type="date" required className="p-4 rounded-xl border border-gray-200 outline-none text-sm font-bold bg-white text-gray-900" />
                        <input name="time" placeholder="Waktu (e.g. 09:00)" required className="p-4 rounded-xl border border-gray-200 outline-none text-sm font-bold bg-white text-gray-900" />
                        <input name="price" type="number" placeholder="Harga Tiket" required className="p-4 rounded-xl border border-gray-200 outline-none text-sm font-bold bg-white text-gray-900" />
                        <textarea name="description" placeholder="Deskripsi" className="p-4 rounded-xl border border-gray-200 outline-none text-sm font-bold md:col-span-2 h-24 bg-white text-gray-900" />
                        <div className="flex gap-4 md:col-span-2">
                           <button type="submit" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase">Simpan</button>
                           <button type="button" onClick={() => setShowAddEventForm(false)} className="bg-red-500 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase">Batal</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-50 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                          <th className="px-4 py-4">ID</th>
                          <th className="px-4 py-4">Judul</th>
                          <th className="px-4 py-4">Tipe</th>
                          <th className="px-4 py-4">Harga</th>
                          <th className="px-4 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {events.map((e, i) => (
                          <tr key={e.id} className="text-sm font-bold text-gray-600">
                            <td className="px-4 py-4">{i + 1}</td>
                            <td className="px-4 py-4">{e.title}</td>
                            <td className="px-4 py-4 text-[9px] uppercase text-orange-500">{e.type}</td>
                            <td className="px-4 py-4">Rp {e.price.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-4 text-center">
                               <button onClick={() => handleDeleteEvent(e.id)} className="bg-red-500 text-white px-3 py-1 rounded-md text-[8px] font-black uppercase">Hapus</button>
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
    <div className="min-h-screen flex flex-col">
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
        <div className="space-y-6">
           <div className="flex gap-4">
              <img src={selectedEventForCheckout?.image_url} className="w-24 h-24 object-cover rounded-2xl" alt="event" />
              <div>
                <h4 className="font-black text-lg text-gray-800 leading-tight">{selectedEventForCheckout?.title}</h4>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{selectedEventForCheckout?.type} | {selectedEventForCheckout?.event_date}</p>
                <p className="text-xs font-bold text-gray-400 mt-2">Rp {selectedEventForCheckout?.price.toLocaleString('id-ID')}</p>
              </div>
           </div>
           <div className="space-y-4 pt-4 border-t border-gray-50">
             <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Peserta</label>
                <input type="text" readOnly value={user?.name} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-400" />
             </div>
             <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input type="text" readOnly value={user?.email} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none font-bold text-gray-400" />
             </div>
             <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Jumlah Tiket</label>
                <input 
                  id="ticket-qty" 
                  type="number" 
                  defaultValue={1} 
                  min={1} 
                  className="w-full bg-white border border-gray-300 p-3 rounded-xl outline-none focus:border-orange-500 font-bold text-gray-900 transition-all" 
                />
             </div>
           </div>
           <div className="flex gap-4">
             <button onClick={() => handleCheckout(parseInt((document.getElementById('ticket-qty') as HTMLInputElement).value) || 1)} className="flex-grow bg-orange-500 text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-orange-600 transition-all">Add to Cart</button>
             <button onClick={() => setSelectedEventForCheckout(null)} className="px-6 text-gray-400 font-black text-xs uppercase">Batal</button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedTicketForInvoice} onClose={() => setSelectedTicketForInvoice(null)} title="INVOICE">
        <div className="space-y-8 text-center">
           <div>
              <h4 className="text-xl font-black text-orange-500 uppercase tracking-[0.2em] mb-1">INVOICE</h4>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Silakan lakukan pembayaran</p>
           </div>
           <div className="bg-gray-50 p-6 rounded-2xl text-left text-sm font-bold text-gray-600 space-y-4 border border-gray-100">
             <div className="flex justify-between">
                <span className="text-[9px] uppercase tracking-widest text-gray-400">No. Invoice:</span>
                <span className="text-gray-800">{selectedTicketForInvoice?.id}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-[9px] uppercase tracking-widest text-gray-400">Event:</span>
                <span className="text-gray-800">{selectedTicketForInvoice?.event?.title}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-[9px] uppercase tracking-widest text-gray-400">Total Tagihan:</span>
                <span className="text-orange-500 font-black">Rp {selectedTicketForInvoice?.total_price.toLocaleString('id-ID')}</span>
             </div>
           </div>
           <div className="flex gap-4">
              <button onClick={() => { setSelectedTicketForPayment(selectedTicketForInvoice); setSelectedTicketForInvoice(null); setPaymentStep('methods'); }} className="flex-grow bg-orange-500 text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl">Payment</button>
              <button onClick={() => setSelectedTicketForInvoice(null)} className="px-6 text-gray-400 font-black text-xs uppercase">Batal</button>
           </div>
        </div>
      </Modal>

      <Modal isOpen={!!selectedTicketForPayment} onClose={() => setSelectedTicketForPayment(null)} title="PAY NOW">
        <div className="space-y-8 text-center animate-fade-in">
           <div>
              <h4 className="text-xl font-black text-orange-500 uppercase tracking-[0.2em] mb-1">PAY NOW</h4>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Pilih metode pembayaran</p>
           </div>

           {paymentStep === 'methods' && (
              <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'bank', icon: '🏦', label: 'Transfer Bank' },
                   { id: 'wallet', icon: '📱', label: 'E-Wallet' },
                   { id: 'qris', icon: '🔳', label: 'QRIS' }
                 ].map(m => (
                   <button key={m.id} onClick={() => setPaymentStep(m.id as any)} className="bg-white p-4 border-2 border-gray-50 rounded-2xl hover:border-orange-500 transition-all">
                      <div className="text-2xl mb-2">{m.icon}</div>
                      <span className="text-[8px] font-black uppercase tracking-widest">{m.label}</span>
                   </button>
                 ))}
              </div>
           )}

           {paymentStep === 'bank' && (
             <div className="space-y-6">
               <div className="grid grid-cols-2 gap-3">
                 {['BCA', 'Mandiri', 'BNI', 'BRI'].map(b => (
                   <button key={b} onClick={() => setSelectedBank(b)} className={`p-4 border-2 rounded-xl font-black text-[9px] uppercase tracking-widest ${selectedBank === b ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-100'}`}>{b}</button>
                 ))}
               </div>
               {selectedBank && (
                 <div className="bg-blue-50 p-6 rounded-2xl animate-slide-up">
                    <p className="font-black text-blue-900 text-lg">{selectedBank} 123-456-7890</p>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">a.n NOVA Community</p>
                 </div>
               )}
             </div>
           )}

           {paymentStep === 'wallet' && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {['GoPay', 'DANA', 'OVO', 'ShopeePay'].map(w => (
                    <button key={w} onClick={() => setSelectedWallet(w)} className={`p-4 border-2 rounded-xl font-black text-[9px] uppercase tracking-widest ${selectedWallet === w ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-100'}`}>{w}</button>
                  ))}
                </div>
                {selectedWallet && (
                  <div className="bg-orange-50 p-6 rounded-2xl animate-slide-up">
                     <p className="font-black text-orange-900 text-lg">{selectedWallet} 0812-3456-7890</p>
                     <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mt-1">a.n NOVA Community</p>
                  </div>
                )}
             </div>
           )}

           {paymentStep === 'qris' && (
             <div className="flex flex-col items-center gap-4">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=QRIS_DEMO" className="w-48 h-48 border-4 border-orange-50 rounded-2xl" alt="QRIS" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Scan QRIS untuk membayar</p>
             </div>
           )}

           <div className="flex gap-4">
              <button onClick={() => setPaymentStep('methods')} className="flex-grow bg-gray-500 text-white p-3 rounded-xl font-black text-[9px] uppercase">Kembali</button>
              {(selectedBank || selectedWallet || paymentStep === 'qris') && (
                <button onClick={() => confirmPayment(selectedTicketForPayment!.id)} className="flex-grow bg-orange-500 text-white p-3 rounded-xl font-black text-[9px] uppercase">Pay Now</button>
              )}
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;

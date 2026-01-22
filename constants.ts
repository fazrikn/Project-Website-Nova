
import { Service } from './types';

export const SERVICES_DATA: Service[] = [
  {
    id: 'publisher',
    title: 'Publisher',
    icon: '📚',
    shortDesc: 'Jurnal internasional bereputasi.',
    fullDesc: 'Platform publikasi akademik terdepan yang mendukung penyebaran ilmu pengetahuan melalui jurnal internasional, prosiding konferensi, dan monografi.',
    features: ['Jurnal Internasional Bereputasi', 'Sistem Peer Review Cepat & Akurat', 'Indeksasi Global (Scopus, DOAJ, dll)'],
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'conference',
    title: 'Conference',
    icon: '🎤',
    shortDesc: 'Manajemen acara skala global.',
    fullDesc: 'IGERS adalah sistem manajemen acara all-in-one yang menangani seluruh siklus hidup konferensi, mulai dari pengiriman abstrak, registrasi, hingga manajemen pembayaran.',
    features: ['Manajemen Submission Paper', 'Sistem Registrasi Peserta Online', 'Manajemen Pembayaran Terintegrasi'],
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'academy',
    title: 'Academy',
    icon: '🎓',
    shortDesc: 'Pelatihan dan sertifikasi.',
    fullDesc: 'Kami menyediakan program pelatihan intensif dan sertifikasi profesional untuk meningkatkan kompetensi akademik dan karir peserta.',
    features: ['Workshop & Bootcamp Intensif', 'Sertifikasi Internasional', 'Mentorship oleh Ahli'],
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'partnership',
    title: 'Partnership & Service',
    icon: '🔬',
    shortDesc: 'Kolaborasi riset terapan.',
    fullDesc: 'NUTRAL berkolaborasi dengan institusi akademik dan industri untuk menyediakan solusi khusus dan meningkatkan visibilitas riset secara global.',
    features: ['Kolaborasi Institusional', 'Layanan Akademik Kustom', 'Peningkatan Visibilitas & Dampak Riset'],
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2069&auto=format&fit=crop'
  }
];

export const NEWS_DATA = [
  { 
    title: "NOVA Partners with Community Colleges", 
    date: "2 days ago", 
    desc: "Launching new initiatives to boost local employment." 
  },
  { 
    title: "John Boone Receives IUPESM Award", 
    date: "1 week ago", 
    desc: "Our lead researcher recognized globally." 
  },
  { 
    title: "NOVA Releases 2025 Research Agenda", 
    date: "2 weeks ago", 
    desc: "Focusing on sustainable tech and education." 
  }
];

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar, MapPin, ArrowRight, Star, Users, Zap, Globe, Shield, TrendingUp, ChevronDown, Sparkles, Music, Briefcase, Code, Heart, Camera, Dumbbell, BookOpen, Mic, Flame } from 'lucide-react';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import EventCard from '../components/events/EventCard.jsx';
import Button from '../components/ui/Button.jsx';
import { EventCardSkeleton } from '../components/ui/Skeleton.jsx';
import { eventService, categoryService } from '../services/eventService.js';
import { formatNumber } from '../utils/formatters.js';
import { cn } from '../utils/cn.js';

const STATS = [
  { value: '50K+',  label: 'Events Hosted',     icon: Calendar },
  { value: '2M+',   label: 'Happy Attendees',    icon: Users },
  { value: '500+',  label: 'Cities Across India', icon: MapPin },
  { value: '98%',   label: 'Satisfaction Rate',   icon: Star },
];

const FEATURES = [
  { icon: Zap,        title: 'Instant Booking',     desc: 'Book tickets in seconds with our streamlined checkout. Get QR tickets delivered instantly to your inbox.',            gradient: 'from-brand-500/20 to-amber-500/20',   color: 'text-brand-400' },
  { icon: Shield,     title: 'Secure & Trusted',     desc: 'Your data is encrypted end-to-end. Secure payment processing with full buyer protection guaranteed.',               gradient: 'from-emerald-500/20 to-teal-600/20',  color: 'text-emerald-400' },
  { icon: TrendingUp, title: 'Smart Analytics',      desc: 'Powerful real-time insights for organizers — ticket sales, revenue, attendance, and audience demographics.',         gradient: 'from-amber-500/20 to-orange-600/20',  color: 'text-amber-400' },
  { icon: Globe,      title: 'Hybrid Events',        desc: 'Host in-person, virtual, or hybrid events. Reach audiences across Bharat and globally with live streaming.',        gradient: 'from-cyan-500/20 to-blue-600/20',     color: 'text-cyan-400' },
  { icon: Sparkles,   title: 'AI-Powered Tools',     desc: 'Let AI write your event descriptions, create speaker bios, and give attendees personalized event recommendations.', gradient: 'from-pink-500/20 to-rose-600/20',     color: 'text-pink-400' },
  { icon: Users,      title: 'Networking Hub',       desc: 'Connect with like-minded people. Exchange digital cards and build lasting professional relationships.',              gradient: 'from-brand-500/20 to-red-500/20',     color: 'text-brand-300' },
];

const TESTIMONIALS = [
  { name: 'Arjun Sharma',    role: 'Tech Conference Organizer, Bengaluru', avatar: 'https://i.pravatar.cc/80?img=11', rating: 5, text: 'EventHub transformed how we manage our annual tech summit. The analytics dashboard alone saved us 15+ hours a week. Ekdum game-changing!' },
  { name: 'Kavya Nair',      role: 'Music Festival Director, Chennai',      avatar: 'https://i.pravatar.cc/80?img=5',  rating: 5, text: 'We sold out 8,000 tickets in under 24 hours using EventHub. The QR check-in system worked flawlessly. Best platform in India!' },
  { name: 'Rahul Mehta',     role: 'Startup Founder, Mumbai',               avatar: 'https://i.pravatar.cc/80?img=12', rating: 5, text: 'Found incredible startup workshops through EventHub that changed my career. Networking feature helped me find my co-founder!' },
  { name: 'Deepika Reddy',   role: 'Corporate Events Manager, Hyderabad',   avatar: 'https://i.pravatar.cc/80?img=9',  rating: 5, text: 'Certificate generation for training workshops is brilliant. Participants love their digital credentials — very professional look!' },
];

const CITIES = [
  { name: 'Mumbai',    emoji: '🌊', count: '4.2K' },
  { name: 'Delhi',     emoji: '🏛️', count: '3.8K' },
  { name: 'Bengaluru', emoji: '🌿', count: '5.1K' },
  { name: 'Chennai',   emoji: '🎭', count: '2.9K' },
  { name: 'Hyderabad', emoji: '💎', count: '2.4K' },
  { name: 'Pune',      emoji: '🎓', count: '1.8K' },
];

const FAQS = [
  { q: 'How do I create my first event?', a: 'Sign up as an organizer, click "Create Event", fill in your event details, set ticket types, and publish. Your event will be live in minutes.' },
  { q: 'What payment methods are accepted?', a: 'We support UPI, credit/debit cards, net banking, Paytm, and more. Free events require no payment setup.' },
  { q: 'How does QR ticket check-in work?', a: 'Each booking generates a unique QR code. Staff scan it at the entrance using our mobile-optimized QR scanner for instant validation.' },
  { q: 'Can I host virtual and hybrid events?', a: 'Yes! EventHub supports in-person, fully virtual, and hybrid formats. Add your streaming link and manage both audiences seamlessly.' },
  { q: 'How are refunds handled?', a: 'You set your refund policy. We facilitate refunds automatically according to your configured terms, with full transparency to attendees.' },
  { q: 'Is there a fee for free events?', a: 'EventHub charges zero fees for free events. For paid events, we charge a small platform fee of 2% + payment processing fees.' },
];

function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericEnd = parseInt(end.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * numericEnd));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, numericEnd, duration]);

  return <span ref={ref}>{formatNumber(count)}{end.replace(/[0-9,.]/g, '')}</span>;
}

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass-card overflow-hidden"
    >
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-medium text-white">{q}</span>
        <ChevronDown className={cn('w-5 h-5 text-slate-400 transition-transform shrink-0 ml-4', open && 'rotate-180')} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? 'auto' : 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

const FALLBACK_EVENTS = [
  { _id: 'f1', title: 'Diwali Grand Utsav 2026', slug: 'diwali-grand-utsav', banner: 'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80', startDate: '2026-10-20', endDate: '2026-10-22', venue: { city: 'Mumbai', country: 'IN' }, type: 'in-person', ticketTypes: [{ price: 499, quantity: 5000, sold: 4200 }], stats: { views: 32000, avgRating: 4.9 }, registeredCount: 4200, isFeatured: true, isTrending: true, category: { name: 'Arts', icon: '🪔', color: '#f59e0b' }, organizer: { displayName: 'Mumbai Utsav Samiti', avatar: null } },
  { _id: 'f2', title: 'Bengaluru Tech Summit 2026', slug: 'bengaluru-tech-summit', banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80', startDate: '2026-07-15', endDate: '2026-07-17', venue: { city: 'Bengaluru', country: 'IN' }, type: 'hybrid', ticketTypes: [{ price: 999, quantity: 3000, sold: 2100 }], stats: { views: 18000, avgRating: 4.8 }, registeredCount: 2100, isFeatured: true, category: { name: 'Technology', icon: '💻', color: '#6366f1' }, organizer: { displayName: 'TechBengaluru', avatar: null } },
  { _id: 'f3', title: 'Holi Color Carnival — Delhi', slug: 'holi-color-carnival', banner: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', startDate: '2026-03-14', endDate: '2026-03-14', venue: { city: 'New Delhi', country: 'IN' }, type: 'in-person', ticketTypes: [{ price: 299, quantity: 8000, sold: 7500 }], stats: { views: 45000, avgRating: 4.9 }, registeredCount: 7500, isTrending: true, category: { name: 'Festival', icon: '🎨', color: '#ec4899' }, organizer: { displayName: 'India Festivals Co.', avatar: null } },
  { _id: 'f4', title: 'Carnatic Music Festival', slug: 'carnatic-music-fest', banner: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', startDate: '2026-12-10', endDate: '2026-12-15', venue: { city: 'Chennai', country: 'IN' }, type: 'in-person', ticketTypes: [{ price: 150, quantity: 2000, sold: 1800 }], stats: { views: 12000, avgRating: 4.9 }, registeredCount: 1800, category: { name: 'Music', icon: '🎵', color: '#ec4899' }, organizer: { displayName: 'Sangam Music Foundation', avatar: null } },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  const { data: trendingData, isLoading: trendingLoading } = useQuery({ queryKey: ['trending-events'], queryFn: eventService.getTrending, staleTime: 5 * 60 * 1000 });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/events?search=${encodeURIComponent(searchVal.trim())}`);
    else navigate('/events');
  };

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-hero-gradient" />
          {/* Saffron/orange glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/25 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-600/8 rounded-full blur-3xl" />
          <div className="absolute top-20 right-20 w-48 h-48 bg-red-500/15 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(249,115,22,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.4) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-brand-500/15 border border-brand-500/40 text-brand-300 text-sm"
          >
            <Flame className="w-4 h-4 text-brand-400" />
            <span>India's fastest-growing event platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Bharat's Premier</span>
            <br />
            <span className="gradient-text">Event Platform</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            From Diwali grand utsavs to startup summits, music festivals to corporate conferences — discover, create, and manage extraordinary events across India.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8"
          >
            <div className="flex-1 flex items-center gap-3 glass-card px-4 py-3 rounded-2xl">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search events, venues, cities across India…"
                className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
            <Button size="lg" type="submit" className="shrink-0 rounded-2xl">
              Explore Events <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.form>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-slate-400"
          >
            {['50K+ live events', '500+ cities', 'UPI & Cards accepted', 'Free to discover'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-brand-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1"><CountUp end={value} /></p>
                <p className="text-sm text-slate-400">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by City */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Events Near You</h2>
            <p className="text-slate-400 text-sm">Find events happening in your city</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CITIES.map(({ name, emoji, count }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/events?city=${encodeURIComponent(name)}`}
                  className="glass-card p-4 flex flex-col items-center text-center hover:border-brand-500/30 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 block group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{emoji}</span>
                  <p className="font-semibold text-white text-sm">{name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{count} events</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Browse by Category</h2>
            <p className="text-slate-400 max-w-xl mx-auto">From Carnatic music to AI summits — find events that ignite your passion</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(categoriesData?.categories || [
              { name: 'Technology',   icon: '💻', color: '#6366f1', slug: 'technology', eventCount: 5240 },
              { name: 'Music',        icon: '🎵', color: '#ec4899', slug: 'music',      eventCount: 4890 },
              { name: 'Business',     icon: '💼', color: '#f59e0b', slug: 'business',   eventCount: 3560 },
              { name: 'Health',       icon: '🏥', color: '#10b981', slug: 'health',     eventCount: 2430 },
              { name: 'Arts',         icon: '🎨', color: '#8b5cf6', slug: 'arts',       eventCount: 1920 },
              { name: 'Sports',       icon: '⚽', color: '#f97316', slug: 'sports',     eventCount: 3780 },
              { name: 'Education',    icon: '📚', color: '#06b6d4', slug: 'education',  eventCount: 4650 },
              { name: 'Food & Drink', icon: '🍛', color: '#84cc16', slug: 'food-drink', eventCount: 1290 },
            ]).map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/events?category=${cat._id || cat.slug}`}
                  className="group glass-card p-5 flex flex-col items-center text-center hover:border-brand-500/30 hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300 block"
                >
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <p className="font-semibold text-white text-sm mb-1">{cat.name}</p>
                  <p className="text-xs text-slate-400">{formatNumber(cat.eventCount || 0)} events</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Events */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-brand-400" />
                <span className="text-brand-400 text-sm font-medium">Trending Now</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">Hot Events in India</h2>
            </div>
            <Link to="/events?sort=popular">
              <Button variant="secondary" size="sm" className="hidden sm:flex">View All <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </motion.div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {((trendingData?.events?.length ? trendingData.events : FALLBACK_EVENTS)).slice(0, 4).map((event, i) => (
                <EventCard key={event._id} event={event} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/3 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-brand-400 text-sm font-medium mb-3 block">Why EventHub?</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything you need to succeed</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Powerful tools for organizers, seamless experience for attendees. Built for India, loved by all.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, gradient, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-6 hover:border-brand-500/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300', gradient)}>
                  <Icon className={cn('w-6 h-6', color)} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Loved across India</h2>
            <p className="text-slate-400">What our community says about EventHub</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map(({ name, role, avatar, rating, text }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex flex-col gap-4"
              >
                <div className="flex">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/30" />
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-slate-400">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card p-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl overflow-hidden mx-auto mb-6 shadow-glow-lg">
                <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to create something unforgettable?</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join 50,000+ organizers across India who trust EventHub to bring their events to life. Start for free today.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/register?role=organizer')} className="rounded-2xl">
                  <Sparkles className="w-5 h-5" /> Start Creating Events
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/events')} className="rounded-2xl">
                  Explore Events <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about EventHub</p>
          </motion.div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => <FaqItem key={faq.q} {...faq} index={i} />)}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

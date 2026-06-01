import { Link } from 'react-router-dom';
import { Twitter, Github, Linkedin, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Discover Events', href: '/events' },
    { label: 'Virtual Events', href: '/events?type=virtual' },
    { label: 'Featured Events', href: '/events?isFeatured=true' },
    { label: 'Create an Event', href: '/organizer/events/create' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  Support: [
    { label: 'Help Center', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface-50/50 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-glow">
                <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
              </div>
              <span className="text-xl font-bold gradient-text">EventHub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              Bharat's premier platform for discovering, managing, and experiencing events. Connecting communities across India, one event at a time.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-400" /><a href="mailto:hello@eventhub.io" className="hover:text-white transition-colors">hello@eventhub.io</a></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-400" /><span>+91 98765 43210</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-400" /><span>Mumbai, Maharashtra, India</span></div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-slate-400 text-sm hover:text-white transition-colors hover:translate-x-0.5 inline-block">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} EventHub. All rights reserved.</p>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> by the EventHub team
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

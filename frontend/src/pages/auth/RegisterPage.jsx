import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';
import { cn } from '../../utils/cn.js';

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
  role:      z.enum(['attendee', 'organizer']),
  terms:     z.boolean().refine(v => v, 'You must accept the terms'),
});

const ROLES = [
  { value: 'attendee', label: 'Attendee', desc: 'Discover and attend events', icon: '🎟️' },
  { value: 'organizer', label: 'Organizer', desc: 'Create and manage events', icon: '🎯' },
];

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function RegisterPage() {
  const { register: registerUser, loginWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const defaultRole = (searchParams.get('role') === 'organizer') ? 'organizer' : 'attendee';

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole, terms: false },
  });

  const selectedRole = watch('role');
  const password = watch('password') || '';
  const passwordChecks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)];

  const onSubmit = async (data) => {
    try {
      const { terms, ...userData } = data;
      await registerUser(userData);
      toast.success('Account created! Welcome to EventHub 🎉');
      navigate(selectedRole === 'organizer' ? '/organizer' : '/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(selectedRole);
      toast.success('Account created! Welcome to EventHub 🎉');
      navigate(selectedRole === 'organizer' ? '/organizer' : '/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-brand-900/60 to-surface relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-hero-gradient opacity-70" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-glow">
              <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold gradient-text">EventHub</span>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4">Join India's biggest event community.</h2>
          <p className="text-slate-400 mb-8">Create your free account and unlock access to thousands of events across India, powerful organizer tools, and an incredible community.</p>
          <div className="space-y-4">
            {['Create your free account in 60 seconds', 'Access 50,000+ events across India', 'AI-powered event recommendations', 'Manage events with enterprise-grade tools'].map(item => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-brand-500/30 border border-brand-500/50 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span className="text-slate-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md py-8"
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-glow">
              <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
            </div>
            <span className="font-bold gradient-text">EventHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400">Join 2M+ people on EventHub — it's free</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map(({ value, label, desc, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('role', value)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all duration-200',
                  selectedRole === value ? 'bg-brand-500/20 border-brand-500/50 shadow-glow' : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                )}
              >
                <span className="text-xl mb-2 block">{icon}</span>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </button>
            ))}
          </div>

          {/* Google signup */}
          <Button variant="secondary" fullWidth size="lg" isLoading={googleLoading} onClick={handleGoogleSignup} className="mb-6">
            <GoogleIcon /> Continue with Google
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-500 text-sm">or with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" placeholder="Alex" icon={User} error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" placeholder="Johnson" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Email address" type="email" placeholder="you@example.com" icon={Mail} error={errors.email?.message} {...register('email')} />
            <div>
              <Input
                label="Password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                icon={Lock}
                error={errors.password?.message}
                iconRight={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-white transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password')}
              />
              {password && (
                <div className="flex gap-2 mt-2">
                  {['8+ chars', 'Uppercase', 'Number'].map((label, i) => (
                    <span key={label} className={cn('text-xs px-2 py-0.5 rounded-full transition-colors', passwordChecks[i] ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500')}>
                      {passwordChecks[i] ? '✓' : '○'} {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/30" {...register('terms')} />
              <span className="text-sm text-slate-400">
                I agree to EventHub's{' '}
                <Link to="/terms" className="text-brand-400 hover:text-brand-300">Terms of Service</Link> and{' '}
                <Link to="/privacy" className="text-brand-400 hover:text-brand-300">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Create Account <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

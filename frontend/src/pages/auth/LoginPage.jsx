import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { firebaseConfigured } from '../../lib/firebase.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await loginWithEmail(data.email, data.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally { setGoogleLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-brand-900/60 to-surface relative overflow-hidden p-12 flex-col justify-between">
        <div className="absolute inset-0 bg-hero-gradient opacity-70" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-brand-500/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl" />

        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-glow">
              <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold gradient-text">EventHub</span>
          </Link>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Bharat's greatest events<br />are waiting for you.
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Join 2M+ people discovering amazing events across India. Sign in to access your tickets, connect with attendees, and manage your experiences.
          </p>
          <div className="flex flex-wrap gap-3">
            {['🪔 Diwali Utsavs', '💻 Tech Summits', '🎵 Music Festivals', '🚀 Startup Conclaves'].map(tag => (
              <span key={tag} className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 text-sm">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl overflow-hidden shadow-glow">
              <img src="/favicon.svg" alt="EventHub" className="w-full h-full" />
            </div>
            <span className="font-bold gradient-text">EventHub</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-slate-400">Sign in to your EventHub account</p>
          </div>

          {/* Google sign-in — only show when Firebase is configured */}
          {firebaseConfigured && (
            <>
              <Button variant="secondary" fullWidth size="lg" isLoading={googleLoading} onClick={handleGoogleLogin} className="mb-6">
                <GoogleIcon />
                Continue with Google
              </Button>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-500 text-sm">or continue with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="Your password"
              icon={Lock}
              error={errors.password?.message}
              iconRight={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-slate-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/30" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</Link>
            </div>

            <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="mt-2">
              Sign In <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Create one free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Ticket, Calendar, Users, Award, Bookmark,
  Camera, MapPin, Briefcase, Globe, Twitter, Linkedin, Github, Save, Bell
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import Button from '../../components/ui/Button.jsx';
import Input, { Textarea } from '../../components/ui/Input.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { uploadService } from '../../services/eventService.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',    href: '/dashboard', exact: true },
  { icon: Ticket,          label: 'My Tickets',   href: '/my-tickets' },
  { icon: Calendar,        label: 'My Events',    href: '/my-events' },
  { icon: Users,           label: 'Networking',   href: '/networking' },
  { icon: Award,           label: 'Certificates', href: '/certificates' },
  { icon: Bookmark,        label: 'Saved Events', href: '/saved-events' },
];

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  location: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
  interests: z.string().optional(),
});

const INTEREST_OPTIONS = [
  'Technology', 'Music', 'Business', 'Arts', 'Sports', 'Food',
  'Science', 'Health', 'Education', 'Gaming', 'Travel', 'Networking',
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || []);
  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.social?.website || '',
      social: {
        twitter: user?.social?.twitter || '',
        linkedin: user?.social?.linkedin || '',
        github: user?.social?.github || '',
      },
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: () => { toast.success('Profile updated'); queryClient.invalidateQueries(['me']); },
    onError: (err) => toast.error(err.message),
  });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadService.uploadAvatar(file);
      await updateProfile({ avatar: url });
      toast.success('Avatar updated');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data) => {
    saveMutation.mutate({
      ...data,
      interests: selectedInterests,
      social: { ...data.social, website: data.website },
    });
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  return (
    <DashboardLayout navItems={NAV} title="Profile">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Your Profile</h2>
          <p className="text-slate-400 text-sm">Manage your personal information and preferences</p>
        </div>

        {/* Avatar section */}
        <div className="glass-card p-6 mb-6 flex items-center gap-6">
          <div className="relative">
            <Avatar src={user?.avatar} name={user?.firstName} size="xl" />
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center transition-colors shadow-lg"
            >
              {uploading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="font-semibold text-white text-lg">{user?.displayName || `${user?.firstName} ${user?.lastName}`}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="mt-1 inline-block text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['profile', 'notifications'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-white/8'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First Name" {...register('firstName')} error={errors.firstName?.message} />
                <Input label="Last Name" {...register('lastName')} error={errors.lastName?.message} />
                <Input label="Display Name" {...register('displayName')} hint="How others see you" className="sm:col-span-2" />
              </div>
              <div className="mt-4">
                <Textarea label="Bio" {...register('bio')} rows={3} hint="Tell the community about yourself" error={errors.bio?.message} />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Location" icon={MapPin} {...register('location')} placeholder="City, Country" />
                <Input label="Website" icon={Globe} {...register('website')} placeholder="https://yoursite.com" error={errors.website?.message} />
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Social Links</h3>
              <div className="space-y-4">
                <Input label="Twitter / X" icon={Twitter} {...register('social.twitter')} placeholder="@username" />
                <Input label="LinkedIn" icon={Linkedin} {...register('social.linkedin')} placeholder="linkedin.com/in/username" />
                <Input label="GitHub" icon={Github} {...register('social.github')} placeholder="github.com/username" />
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4">Interests</h3>
              <p className="text-slate-400 text-xs mb-4">Select topics you're interested in to get better event recommendations</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedInterests.includes(interest) ? 'bg-brand-500/30 text-brand-300 border border-brand-500/40' : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20 hover:text-white'}`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" icon={Save} isLoading={saveMutation.isPending}>Save Changes</Button>
            </div>
          </form>
        )}

        {activeTab === 'notifications' && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notification Preferences
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Booking confirmations', desc: 'When a booking is confirmed or cancelled' },
                { label: 'Event reminders', desc: '24 hours before your booked events' },
                { label: 'New events from organizers', desc: 'When organizers you follow post new events' },
                { label: 'Networking requests', desc: 'When someone connects with you' },
                { label: 'Certificate available', desc: 'When your event certificate is ready' },
                { label: 'Platform announcements', desc: 'Important updates from EventHub' },
              ].map(({ label, desc }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-white/10 peer-checked:bg-brand-500 rounded-full transition-colors peer-focus:ring-1 peer-focus:ring-brand-400" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button icon={Save} onClick={() => toast.success('Preferences saved')}>Save Preferences</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

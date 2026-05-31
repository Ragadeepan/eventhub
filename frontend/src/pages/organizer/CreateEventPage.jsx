import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Ticket, Plus, Trash2, Image, Globe, Video, ArrowRight, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Input, { Textarea, Select } from '../../components/ui/Input.jsx';
import { eventService, categoryService, uploadService } from '../../services/eventService.js';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: () => <span>←</span>, label: 'Dashboard', href: '/organizer', exact: true },
  { icon: Calendar,             label: 'My Events',  href: '/organizer/events' },
  { icon: Plus,                 label: 'Create',     href: '/organizer/events/create' },
];

const STEPS = ['Basic Info', 'Location & Date', 'Tickets', 'Details', 'Preview'];

const schema = z.object({
  title:            z.string().min(5, 'Title must be at least 5 characters').max(200),
  description:      z.string().min(50, 'Description must be at least 50 characters'),
  shortDescription: z.string().max(300).optional(),
  category:         z.string().min(1, 'Please select a category'),
  type:             z.enum(['in-person', 'virtual', 'hybrid']),
  tags:             z.string().optional(),
  startDate:        z.string().min(1, 'Start date is required'),
  endDate:          z.string().min(1, 'End date is required'),
  timezone:         z.string().default('UTC'),
  venue: z.object({
    name:        z.string().optional(),
    address:     z.string().optional(),
    city:        z.string().optional(),
    state:       z.string().optional(),
    country:     z.string().optional(),
    virtualLink: z.string().optional(),
  }).optional(),
  maxAttendees:        z.coerce.number().optional(),
  certificateEnabled:  z.boolean().default(false),
  networkingEnabled:   z.boolean().default(true),
  waitlistEnabled:     z.boolean().default(true),
  ticketTypes: z.array(z.object({
    name:          z.string().min(1, 'Ticket name required'),
    description:   z.string().optional(),
    price:         z.coerce.number().min(0),
    quantity:      z.coerce.number().min(1, 'Quantity required'),
    maxPerBooking: z.coerce.number().default(10),
  })).min(1, 'Add at least one ticket type'),
});

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [banner, setBanner] = useState(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'in-person',
      timezone: 'UTC',
      ticketTypes: [{ name: 'General Admission', description: '', price: 0, quantity: 100, maxPerBooking: 10 }],
      certificateEnabled: false,
      networkingEnabled: true,
      waitlistEnabled: true,
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ticketTypes' });
  const eventType = watch('type');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return;
      const preview = URL.createObjectURL(file);
      setBannerUrl(preview);
      setBanner(file);
      setUploadingBanner(true);
      try {
        const formData = new FormData();
        formData.append('banner', file);
        const res = await uploadService.eventBanner(formData);
        setBannerUrl(res.url);
        setValue('banner', res.url);
        toast.success('Banner uploaded!');
      } catch { toast.error('Upload failed'); setBannerUrl(''); }
      finally { setUploadingBanner(false); }
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => eventService.createEvent(data),
    onSuccess: (data) => {
      toast.success('Event created! 🎉');
      navigate(`/organizer/events/${data.event._id}/edit?publish=true`);
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = async (data) => {
    if (!bannerUrl) { toast.error('Please upload a banner image'); return; }
    const tags = data.tags ? data.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    await createMutation.mutateAsync({ ...data, banner: bannerUrl, tags, status: 'draft' });
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  return (
    <DashboardLayout navItems={NAV} title="Create Event">
      <div className="max-w-3xl mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <button onClick={() => i < step && setStep(i)} className={cn('flex flex-col items-center gap-1', i < step && 'cursor-pointer')}>
                <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200', i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-500 text-white shadow-glow' : 'bg-white/10 text-slate-500')}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={cn('text-xs font-medium hidden sm:block', i === step ? 'text-white' : 'text-slate-500')}>{label}</span>
              </button>
              {i < STEPS.length - 1 && <div className={cn('flex-1 h-px mx-2 transition-colors', i < step ? 'bg-emerald-500/50' : 'bg-white/10')} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Basic Information</h2>

              {/* Banner upload */}
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Event Banner *</label>
                <div
                  {...getRootProps()}
                  className={cn('relative h-48 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden', isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-white/20 hover:border-white/40 bg-white/3')}
                >
                  <input {...getInputProps()} />
                  {bannerUrl ? (
                    <>
                      <img src={bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                        <p className="text-white text-sm font-medium">Click to replace</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6">
                      <Image className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm mb-1">{isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}</p>
                      <p className="text-xs text-slate-600">PNG, JPG, WEBP up to 5MB</p>
                    </div>
                  )}
                  {uploadingBanner && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <Input label="Event Title *" placeholder="e.g. Global AI Summit 2026" error={errors.title?.message} {...register('title')} />
              <Textarea label="Description *" placeholder="Tell attendees what your event is about…" rows={6} error={errors.description?.message} {...register('description')} />
              <Input label="Short Description (optional)" placeholder="A brief one-liner for event cards" {...register('shortDescription')} />

              <div className="grid grid-cols-2 gap-4">
                <Select label="Category *" error={errors.category?.message} {...register('category')}>
                  <option value="">Select category</option>
                  {(categoriesData?.categories || []).map(cat => <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>)}
                </Select>
                <Select label="Event Type *" error={errors.type?.message} {...register('type')}>
                  <option value="in-person">In-Person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </Select>
              </div>

              <Input label="Tags (comma-separated)" placeholder="tech, ai, conference, networking" {...register('tags')} hint="Tags help attendees discover your event" />
            </motion.div>
          )}

          {/* Step 1: Location & Date */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Location & Date</h2>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Start Date & Time *" type="datetime-local" error={errors.startDate?.message} {...register('startDate')} />
                <Input label="End Date & Time *" type="datetime-local" error={errors.endDate?.message} {...register('endDate')} />
              </div>

              <Select label="Timezone" {...register('timezone')}>
                {['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Denver', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney'].map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </Select>

              {(eventType === 'in-person' || eventType === 'hybrid') && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4" />Venue Details</h3>
                  <Input label="Venue Name" placeholder="e.g. Moscone Center" {...register('venue.name')} />
                  <Input label="Address" placeholder="Street address" {...register('venue.address')} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" placeholder="San Francisco" {...register('venue.city')} />
                    <Input label="State / Province" placeholder="CA" {...register('venue.state')} />
                  </div>
                  <Input label="Country" placeholder="United States" {...register('venue.country')} />
                </div>
              )}

              {(eventType === 'virtual' || eventType === 'hybrid') && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4"><Video className="w-4 h-4" />Virtual Link</h3>
                  <Input label="Streaming URL" placeholder="https://zoom.us/j/..." type="url" {...register('venue.virtualLink')} />
                </div>
              )}

              <Input label="Max Attendees (optional)" type="number" placeholder="Leave blank for unlimited" {...register('maxAttendees')} />
            </motion.div>
          )}

          {/* Step 2: Tickets */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Ticket Types</h2>
                <Button size="sm" variant="secondary" icon={Plus} type="button" onClick={() => append({ name: '', description: '', price: 0, quantity: 100, maxPerBooking: 10 })}>
                  Add Ticket
                </Button>
              </div>
              {errors.ticketTypes?.message && <p className="text-red-400 text-sm">{errors.ticketTypes.message}</p>}

              <div className="space-y-4">
                {fields.map((field, i) => (
                  <motion.div key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-brand-400" />
                        <span className="text-sm font-medium text-white">Ticket #{i + 1}</span>
                      </div>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Ticket name" error={errors.ticketTypes?.[i]?.name?.message} {...register(`ticketTypes.${i}.name`)} />
                      <Input placeholder="Description (optional)" {...register(`ticketTypes.${i}.description`)} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="Price ($)" type="number" min="0" step="0.01" placeholder="0 for free" {...register(`ticketTypes.${i}.price`)} />
                      <Input label="Quantity" type="number" min="1" placeholder="100" {...register(`ticketTypes.${i}.quantity`)} />
                      <Input label="Max Per Booking" type="number" min="1" placeholder="10" {...register(`ticketTypes.${i}.maxPerBooking`)} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Details & Settings */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-6">
              <h2 className="text-lg font-semibold text-white">Event Settings</h2>
              <div className="space-y-4">
                {[
                  { name: 'certificateEnabled', label: 'Certificate of Attendance', desc: 'Issue digital certificates to attendees after the event' },
                  { name: 'networkingEnabled',  label: 'Enable Networking',         desc: 'Allow attendees to connect with each other' },
                  { name: 'waitlistEnabled',    label: 'Enable Waitlist',           desc: 'Allow users to join a waitlist when tickets sell out' },
                ].map(({ name, label, desc }) => (
                  <label key={name} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/8 transition-colors">
                    <input type="checkbox" className="mt-0.5 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/30" {...register(name)} />
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mx-auto shadow-glow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Ready to launch!</h2>
                <p className="text-slate-400 text-sm">Your event will be saved as a draft. You can review and publish it from your events dashboard.</p>
              </div>
              {bannerUrl && <img src={bannerUrl} alt="Event banner preview" className="w-full h-40 object-cover rounded-2xl" />}
              <Button fullWidth size="lg" type="submit" isLoading={createMutation.isPending} icon={CheckCircle}>
                Save Draft & Continue
              </Button>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <Button type="button" variant="secondary" fullWidth size="lg" onClick={prevStep} icon={ArrowLeft}>
                Back
              </Button>
            )}
            {step < STEPS.length - 1 && (
              <Button type="button" fullWidth size="lg" onClick={nextStep}>
                Continue <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

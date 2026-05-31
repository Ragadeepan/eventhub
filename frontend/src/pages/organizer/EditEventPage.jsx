import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Ticket, Plus, Trash2, Image, Video,
  ArrowLeft, Save, Globe, CheckCircle, Send
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Input, { Textarea, Select } from '../../components/ui/Input.jsx';
import { eventService, categoryService, uploadService } from '../../services/eventService.js';
import { useDropzone } from 'react-dropzone';
import { cn } from '../../utils/cn.js';
import toast from 'react-hot-toast';

const NAV = [
  { icon: ArrowLeft, label: 'My Events', href: '/organizer/events' },
  { icon: Calendar,  label: 'Create New', href: '/organizer/events/create' },
];

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
  maxAttendees:       z.coerce.number().optional(),
  certificateEnabled: z.boolean().default(false),
  networkingEnabled:  z.boolean().default(true),
  waitlistEnabled:    z.boolean().default(true),
  ticketTypes: z.array(z.object({
    name:          z.string().min(1, 'Ticket name required'),
    description:   z.string().optional(),
    price:         z.coerce.number().min(0),
    quantity:      z.coerce.number().min(1),
    maxPerBooking: z.coerce.number().default(10),
  })).min(1, 'Add at least one ticket type'),
});

function toLocalDatetime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [bannerUrl, setBannerUrl] = useState('');
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['event-edit', id],
    queryFn: () => eventService.getById(id),
    enabled: !!id,
  });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

  const event = eventData?.event;

  const { register, handleSubmit, control, watch, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'in-person',
      timezone: 'UTC',
      ticketTypes: [{ name: 'General Admission', description: '', price: 0, quantity: 100, maxPerBooking: 10 }],
      certificateEnabled: false,
      networkingEnabled: true,
      waitlistEnabled: true,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'ticketTypes' });
  const eventType = watch('type');

  useEffect(() => {
    if (!event) return;
    setBannerUrl(event.banner || '');
    reset({
      title:            event.title || '',
      description:      event.description || '',
      shortDescription: event.shortDescription || '',
      category:         event.category?._id || event.category || '',
      type:             event.type || 'in-person',
      tags:             (event.tags || []).join(', '),
      startDate:        toLocalDatetime(event.startDate),
      endDate:          toLocalDatetime(event.endDate),
      timezone:         event.timezone || 'UTC',
      venue:            event.venue || {},
      maxAttendees:     event.maxAttendees || '',
      certificateEnabled: event.certificateEnabled || false,
      networkingEnabled:  event.networkingEnabled !== false,
      waitlistEnabled:    event.waitlistEnabled !== false,
      ticketTypes:        event.ticketTypes?.length ? event.ticketTypes : [{ name: 'General Admission', description: '', price: 0, quantity: 100, maxPerBooking: 10 }],
    });
  }, [event, reset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: async ([file]) => {
      if (!file) return;
      setBannerUrl(URL.createObjectURL(file));
      setUploadingBanner(true);
      try {
        const formData = new FormData();
        formData.append('banner', file);
        const res = await uploadService.eventBanner(formData);
        setBannerUrl(res.url);
        toast.success('Banner uploaded');
      } catch { toast.error('Upload failed'); }
      finally { setUploadingBanner(false); }
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) => eventService.updateEvent(id, data),
    onSuccess: () => {
      toast.success('Event saved');
      queryClient.invalidateQueries(['event-edit', id]);
      queryClient.invalidateQueries(['organizer-events']);
    },
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = useMutation({
    mutationFn: () => eventService.publishEvent(id),
    onSuccess: () => {
      toast.success('Event published!');
      queryClient.invalidateQueries(['event-edit', id]);
      queryClient.invalidateQueries(['organizer-events']);
      navigate('/organizer/events');
    },
    onError: (err) => toast.error(err.message),
  });

  const onSubmit = (data) => {
    const tags = data.tags ? data.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    saveMutation.mutate({ ...data, banner: bannerUrl, tags });
  };

  const SECTIONS = ['basic', 'location', 'tickets', 'settings'];

  if (isLoading) {
    return (
      <DashboardLayout navItems={NAV} title="Edit Event">
        <div className="max-w-3xl mx-auto space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-24 animate-pulse" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={NAV} title="Edit Event">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white truncate">{event?.title || 'Edit Event'}</h2>
            <p className="text-slate-400 text-sm mt-0.5">
              Status: <span className={`capitalize ${event?.status === 'published' ? 'text-emerald-400' : 'text-amber-400'}`}>{event?.status}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {event?.status !== 'published' && (
              <Button variant="success" icon={Send} isLoading={publishMutation.isPending} onClick={() => publishMutation.mutate()} size="sm">
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} className={cn('flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-colors', activeSection === s ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white')}>
              {s === 'basic' ? 'Basic Info' : s === 'location' ? 'Location & Date' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Basic Info */}
          {activeSection === 'basic' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-300 block mb-2">Event Banner</label>
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
                      <p className="text-slate-400 text-sm">Drag & drop or click to upload</p>
                    </div>
                  )}
                  {uploadingBanner && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <Input label="Event Title *" error={errors.title?.message} {...register('title')} />
              <Textarea label="Description *" rows={6} error={errors.description?.message} {...register('description')} />
              <Input label="Short Description" {...register('shortDescription')} />

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

              <Input label="Tags (comma-separated)" {...register('tags')} hint="tech, ai, conference" />
            </motion.div>
          )}

          {/* Location & Date */}
          {activeSection === 'location' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-6">
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
                  <Input label="Venue Name" {...register('venue.name')} />
                  <Input label="Address" {...register('venue.address')} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" {...register('venue.city')} />
                    <Input label="State / Province" {...register('venue.state')} />
                  </div>
                  <Input label="Country" {...register('venue.country')} />
                </div>
              )}

              {(eventType === 'virtual' || eventType === 'hybrid') && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4"><Video className="w-4 h-4" />Virtual Link</h3>
                  <Input label="Streaming URL" type="url" {...register('venue.virtualLink')} />
                </div>
              )}

              <Input label="Max Attendees (optional)" type="number" {...register('maxAttendees')} />
            </motion.div>
          )}

          {/* Tickets */}
          {activeSection === 'tickets' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">Ticket Types</h3>
                <Button size="sm" variant="secondary" icon={Plus} type="button" onClick={() => append({ name: '', description: '', price: 0, quantity: 100, maxPerBooking: 10 })}>
                  Add Ticket
                </Button>
              </div>
              {errors.ticketTypes?.message && <p className="text-red-400 text-sm">{errors.ticketTypes.message}</p>}
              <div className="space-y-4">
                {fields.map((field, i) => (
                  <div key={field.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Ticket className="w-4 h-4 text-brand-400" /><span className="text-sm font-medium text-white">Ticket #{i + 1}</span></div>
                      {fields.length > 1 && <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Ticket name" error={errors.ticketTypes?.[i]?.name?.message} {...register(`ticketTypes.${i}.name`)} />
                      <Input placeholder="Description" {...register(`ticketTypes.${i}.description`)} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input label="Price ($)" type="number" min="0" step="0.01" {...register(`ticketTypes.${i}.price`)} />
                      <Input label="Quantity" type="number" min="1" {...register(`ticketTypes.${i}.quantity`)} />
                      <Input label="Max/Booking" type="number" min="1" {...register(`ticketTypes.${i}.maxPerBooking`)} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
              <h3 className="font-semibold text-white mb-2">Event Settings</h3>
              {[
                { name: 'certificateEnabled', label: 'Certificate of Attendance', desc: 'Issue digital certificates to attendees' },
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
            </motion.div>
          )}

          <div className="flex gap-3 mt-6">
            <Button type="submit" fullWidth icon={Save} isLoading={saveMutation.isPending} size="lg">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

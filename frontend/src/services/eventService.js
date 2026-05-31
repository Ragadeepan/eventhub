import api from '../lib/api.js';

export const eventService = {
  getEvents:           (params) => api.get('/events', { params }),
  getEventBySlug:      (slug)   => api.get(`/events/slug/${slug}`),
  getEventById:        (id)     => api.get(`/events/${id}`),
  getById:             (id)     => api.get(`/events/${id}`),
  getTrending:         ()       => api.get('/events/trending'),
  getFeatured:         ()       => api.get('/events/featured'),
  getMyEvents:         (params) => api.get('/events/my-events', { params }),
  getOrganizerEvents:  (params) => api.get('/events/my-events', { params }),
  getSavedEvents:      ()       => api.get('/events/saved'),
  createEvent:         (data)   => api.post('/events', data),
  updateEvent:         (id, data) => api.patch(`/events/${id}`, data),
  publishEvent:        (id)     => api.patch(`/events/${id}/publish`),
  deleteEvent:         (id)     => api.delete(`/events/${id}`),
  bookmarkEvent:       (id)     => api.post(`/events/${id}/bookmark`),
  getAttendees:        (id, params) => api.get(`/events/${id}/attendees`, { params }),
  getEventAttendees:   (id, params) => api.get(`/events/${id}/attendees`, { params }),
};

export const bookingService = {
  createBooking: (data)   => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings', { params }),
  getBooking:    (id)     => api.get(`/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  checkIn:       (eventId, qrData) => api.post(`/bookings/check-in/${eventId}`, { qrData }),
};

export const ticketService = {
  getMyTickets:     ()   => api.get('/tickets'),
  getTicket:        (id) => api.get(`/tickets/${id}`),
  getBookingTickets: (bookingId) => api.get(`/tickets/booking/${bookingId}`),
};

export const categoryService = {
  getAll:    () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  create:    (data) => api.post('/categories', data),
  update:    (id, data) => api.patch(`/categories/${id}`, data),
  delete:    (id) => api.delete(`/categories/${id}`),
};

export const reviewService = {
  getEventReviews: (eventId, params) => api.get(`/reviews/event/${eventId}`, { params }),
  createReview:    (data) => api.post('/reviews', data),
  updateReview:    (id, data) => api.patch(`/reviews/${id}`, data),
  deleteReview:    (id) => api.delete(`/reviews/${id}`),
  markHelpful:     (id) => api.post(`/reviews/${id}/helpful`),
};

export const analyticsService = {
  getOrganizerAnalytics: (params) => api.get('/analytics/organizer', { params }),
  getAdminAnalytics:     ()       => api.get('/analytics/admin'),
  getEventAnalytics:     (id)     => api.get(`/analytics/event/${id}`),
};

export const notificationService = {
  getAll:    () => api.get('/notifications'),
  readAll:   () => api.patch('/notifications/read-all'),
  markRead:  (id) => api.patch(`/notifications/${id}/read`),
  delete:    (id) => api.delete(`/notifications/${id}`),
};

export const certificateService = {
  getMyCerts:   () => api.get('/certificates/my'),
  generate:     (eventId) => api.post('/certificates/generate', { eventId }),
  verify:       (certId)  => api.get(`/certificates/verify/${certId}`),
};

export const waitlistService = {
  join:   (data) => api.post('/waitlist', data),
  leave:  (eventId) => api.delete(`/waitlist/${eventId}`),
  getMy:  () => api.get('/waitlist/my'),
};

export const networkingService = {
  getEventAttendees: (eventId)   => api.get(`/networking/event/${eventId}/attendees`),
  getConnections:    ()          => api.get('/networking/connections'),
  connect:           (userId)    => api.post(`/networking/connect/${userId}`),
  disconnect:        (userId)    => api.delete(`/networking/disconnect/${userId}`),
};

export const adminService = {
  getUsers:    (params) => api.get('/admin/users', { params }),
  banUser:     (id, reason) => api.patch(`/admin/users/${id}/ban`, { reason }),
  unbanUser:   (id) => api.patch(`/admin/users/${id}/unban`),
  changeRole:  (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getEvents:   (params) => api.get('/admin/events', { params }),
  featureEvent: (id, data) => api.patch(`/admin/events/${id}/feature`, data),
  getStats:    () => api.get('/admin/stats'),
};

export const uploadService = {
  avatar:       (formData) => api.post('/upload/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadAvatar: (file)     => { const fd = new FormData(); fd.append('avatar', file); return api.post('/upload/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); },
  eventBanner:  (formData) => api.post('/upload/event-banner', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

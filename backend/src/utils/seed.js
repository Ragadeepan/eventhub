import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Category from '../models/Category.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventhub';

const CATEGORIES = [
  { name: 'Technology',   slug: 'technology',   icon: '💻', color: '#6366f1', gradient: 'from-indigo-500 to-purple-600', sortOrder: 1 },
  { name: 'Music',        slug: 'music',         icon: '🎵', color: '#ec4899', gradient: 'from-pink-500 to-rose-600',   sortOrder: 2 },
  { name: 'Business',     slug: 'business',      icon: '💼', color: '#f59e0b', gradient: 'from-amber-500 to-orange-600', sortOrder: 3 },
  { name: 'Arts',         slug: 'arts',           icon: '🎨', color: '#8b5cf6', gradient: 'from-violet-500 to-purple-600', sortOrder: 4 },
  { name: 'Sports',       slug: 'sports',         icon: '⚽', color: '#10b981', gradient: 'from-emerald-500 to-teal-600', sortOrder: 5 },
  { name: 'Food & Drink', slug: 'food-drink',     icon: '🍛', color: '#f97316', gradient: 'from-orange-500 to-red-600', sortOrder: 6 },
  { name: 'Health',       slug: 'health',         icon: '🏥', color: '#06b6d4', gradient: 'from-cyan-500 to-blue-600',  sortOrder: 7 },
  { name: 'Education',    slug: 'education',      icon: '📚', color: '#3b82f6', gradient: 'from-blue-500 to-indigo-600', sortOrder: 8 },
];

const USERS = [
  { email: 'admin@eventhub.io',     password: 'Admin123!', firstName: 'Alex',    lastName: 'Morgan',  role: 'admin',     isVerified: true, isActive: true },
  { email: 'organizer@eventhub.io', password: 'Admin123!', firstName: 'Arjun',   lastName: 'Sharma',  role: 'organizer', isVerified: true, isActive: true },
  { email: 'staff@eventhub.io',     password: 'Admin123!', firstName: 'Kavya',   lastName: 'Nair',    role: 'staff',     isVerified: true, isActive: true },
  { email: 'user@eventhub.io',      password: 'Admin123!', firstName: 'Rahul',   lastName: 'Mehta',   role: 'attendee',  isVerified: true, isActive: true },
];

const BANNERS = [
  'https://images.unsplash.com/photo-1574169208507-84376144848b?w=1200&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
  'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80',
  'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Event.deleteMany({}), Category.deleteMany({})]);
  console.log('Cleared existing data');

  const categories = await Category.insertMany(CATEGORIES);
  console.log(`Created ${categories.length} categories`);

  const users = await Promise.all(USERS.map((u) => User.create(u)));
  console.log(`Created ${users.length} users`);

  const organizer = users.find(u => u.role === 'organizer');
  const techCat    = categories.find(c => c.slug === 'technology');
  const musicCat   = categories.find(c => c.slug === 'music');
  const bizCat     = categories.find(c => c.slug === 'business');
  const eduCat     = categories.find(c => c.slug === 'education');
  const artsCat    = categories.find(c => c.slug === 'arts');
  const foodCat    = categories.find(c => c.slug === 'food-drink');

  const now = new Date();
  const day = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const EVENTS = [
    {
      title: 'Diwali Grand Utsav 2026',
      description: 'Celebrate the festival of lights at the grandest Diwali event in Mumbai! Experience breathtaking fireworks displays, classical and folk dance performances, live Bollywood music, rangoli competitions, and an elaborate traditional food fair. Artisans from across Rajasthan, Gujarat, and Maharashtra showcase handcrafted diyas, jewelry, and textiles. This three-day cultural extravaganza brings together families, artists, and food lovers in a celebration that honors India\'s rich festive heritage. Special children\'s zone with puppet shows and cultural workshops.',
      shortDescription: 'Mumbai\'s grandest Diwali celebration — fireworks, music, culture, and incredible food.',
      organizer: organizer._id,
      category: artsCat._id,
      tags: ['diwali', 'festival', 'culture', 'bollywood', 'india', 'mumbai'],
      banner: BANNERS[0],
      status: 'published',
      type: 'in-person',
      isFeatured: true,
      isTrending: true,
      venue: { name: 'BKC Festival Grounds', address: 'Bandra Kurla Complex', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      startDate: day(20),
      endDate: day(22),
      timezone: 'Asia/Kolkata',
      maxAttendees: 25000,
      registeredCount: 19800,
      ticketTypes: [
        { name: 'General Entry', description: 'Full access to all festival grounds and performances', price: 499, quantity: 18000, sold: 15200, maxPerBooking: 6 },
        { name: 'Premium Lounge', description: 'Premium viewing area + complimentary snacks + priority entry', price: 1499, quantity: 4000, sold: 3800, maxPerBooking: 4 },
        { name: 'Family Pack (4)', description: 'Family bundle — 2 adults + 2 children general entry', price: 1499, quantity: 3000, sold: 820, maxPerBooking: 2 },
      ],
      certificateEnabled: false,
      networkingEnabled: true,
      waitlistEnabled: true,
      'stats.views': 89400,
      'stats.avgRating': 4.9,
      'stats.reviewCount': 412,
    },
    {
      title: 'Bengaluru Tech Summit 2026',
      description: 'India\'s premier technology conference returns to the Silicon Valley of the East. Join 5,000+ engineers, product managers, and tech leaders for three days of deep technical talks, hands-on workshops, and unparalleled networking. Featured tracks include AI/ML, Cloud Native, DevSecOps, Web3, and Product Design. Keynotes from CTOs of India\'s top unicorns and global tech giants. Includes a 24-hour hackathon with ₹10 lakh prize pool. Startup exhibition featuring 100+ funded Indian startups.',
      shortDescription: 'India\'s largest tech conference — AI, Cloud, DevOps, and unicorn keynotes.',
      organizer: organizer._id,
      category: techCat._id,
      tags: ['technology', 'ai', 'cloud', 'bengaluru', 'conference', 'startup', 'india'],
      banner: BANNERS[1],
      status: 'published',
      type: 'hybrid',
      isFeatured: true,
      isTrending: true,
      venue: { name: 'Bangalore International Exhibition Centre', address: 'Tumkur Road', city: 'Bengaluru', state: 'Karnataka', country: 'India', virtualLink: 'https://zoom.us/j/bengtech2026' },
      startDate: day(35),
      endDate: day(37),
      timezone: 'Asia/Kolkata',
      maxAttendees: 5000,
      registeredCount: 3847,
      ticketTypes: [
        { name: 'Conference Pass', description: 'Full in-person access to all talks and workshops', price: 2999, quantity: 3500, sold: 2800, maxPerBooking: 3 },
        { name: 'Virtual Pass', description: 'Live stream access + recordings for 90 days', price: 799, quantity: 5000, sold: 4100, maxPerBooking: 5 },
        { name: 'VIP Speaker Meet', description: 'Conference pass + exclusive speaker dinner + front-row seats', price: 7999, quantity: 200, sold: 187, maxPerBooking: 1 },
      ],
      certificateEnabled: true,
      networkingEnabled: true,
      waitlistEnabled: true,
      'stats.views': 62300,
      'stats.avgRating': 4.8,
      'stats.reviewCount': 318,
    },
    {
      title: 'Holi Color Carnival — Delhi NCR',
      description: 'Celebrate the most vibrant festival on earth at India\'s biggest Holi event! Hosted at the iconic Jawaharlal Nehru Stadium, this epic celebration features organic color throws, DJ Holi performances with Bollywood remixes, bhang thandai stalls, live dhol performances, and celebrity appearances. 15,000 sq ft of fun zones including foam cannons, water slides, and UV color zones. All colors used are 100% organic and skin-safe, certified by dermatologists. Experience Holi the traditional way — pure joy, color, and celebration!',
      shortDescription: 'India\'s biggest Holi celebration — 100% organic colors, DJ, dhol, and pure joy.',
      organizer: organizer._id,
      category: artsCat._id,
      tags: ['holi', 'festival', 'delhi', 'colors', 'celebration', 'bollywood'],
      banner: BANNERS[2],
      status: 'published',
      type: 'in-person',
      isFeatured: true,
      isTrending: true,
      venue: { name: 'Jawaharlal Nehru Stadium', address: 'Bhishma Pitamah Marg', city: 'New Delhi', state: 'Delhi', country: 'India' },
      startDate: day(10),
      endDate: day(10),
      timezone: 'Asia/Kolkata',
      maxAttendees: 15000,
      registeredCount: 13200,
      ticketTypes: [
        { name: 'Holi Entry', description: 'Full access + 1 color packet + welcome drink', price: 799, quantity: 12000, sold: 10800, maxPerBooking: 8 },
        { name: 'Holi VIP', description: 'Priority entry + unlimited colors + premium lounge + food vouchers', price: 1999, quantity: 2000, sold: 1920, maxPerBooking: 4 },
        { name: 'Couple Pack', description: 'Entry for 2 + 2 color packets + couple photo booth session', price: 1299, quantity: 1000, sold: 480, maxPerBooking: 1 },
      ],
      certificateEnabled: false,
      networkingEnabled: false,
      waitlistEnabled: true,
      'stats.views': 120500,
      'stats.avgRating': 4.9,
      'stats.reviewCount': 892,
    },
    {
      title: 'Carnatic Music Margazhi Mahotsavam',
      description: 'The most prestigious Carnatic classical music festival in India, returning for its 48th edition in Chennai. Over six days, witness performances by legendary vidwans and upcoming maestros across 12 stages. This year\'s edition features Pancharatna Kritis performances, jugalbandis, Bharatanatyam and Kuchipudi dance recitals, and exclusive lecture demonstrations for connoisseurs. Special tribute to Bharat Ratna M.S. Subbulakshmi on her centenary year. Ragas fill the air of Mylapore from dawn to midnight — a celebration of India\'s greatest musical tradition.',
      shortDescription: 'Chennai\'s 48th Margazhi Music Festival — 6 days of Carnatic grandeur across 12 stages.',
      organizer: organizer._id,
      category: musicCat._id,
      tags: ['carnatic', 'classical-music', 'margazhi', 'chennai', 'festival', 'bharatanatyam'],
      banner: BANNERS[3],
      status: 'published',
      type: 'in-person',
      isFeatured: true,
      isTrending: false,
      venue: { name: 'Music Academy & Narada Gana Sabha', address: 'T.T.K. Road, Alwarpet', city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      startDate: day(60),
      endDate: day(65),
      timezone: 'Asia/Kolkata',
      maxAttendees: 8000,
      registeredCount: 6240,
      ticketTypes: [
        { name: '6-Day Festival Pass', description: 'Full access to all 12 stages for all 6 days', price: 1999, quantity: 4000, sold: 3800, maxPerBooking: 4 },
        { name: 'Single Day Pass', description: 'Access to all stages for one day of your choice', price: 499, quantity: 3000, sold: 2200, maxPerBooking: 6 },
        { name: 'Connoisseur\'s Pass', description: 'All-access + backstage meet-artists + lecture demos', price: 4999, quantity: 200, sold: 192, maxPerBooking: 2 },
      ],
      certificateEnabled: false,
      networkingEnabled: true,
      waitlistEnabled: true,
      'stats.views': 28900,
      'stats.avgRating': 4.9,
      'stats.reviewCount': 234,
    },
    {
      title: 'India Startup Conclave — Hyderabad',
      description: 'The definitive gathering for India\'s startup ecosystem. This two-day conclave in Hyderabad brings together 200+ investors (angels, VCs, and family offices), 500+ founders, and government policy makers to shape the future of entrepreneurship in Telangana and beyond. Features a live pitch competition with ₹25 lakh in funding, masterclasses by founders of Ola, Zepto, Groww, and Urban Company, investor speed-dating sessions, and a Deep Tech exhibition showcasing cutting-edge Indian innovations in AI, robotics, and clean energy.',
      shortDescription: 'Hyderabad\'s biggest startup event — pitch ₹25L, meet 200+ investors, learn from unicorn founders.',
      organizer: organizer._id,
      category: bizCat._id,
      tags: ['startup', 'entrepreneurship', 'venture-capital', 'hyderabad', 'india', 'investment'],
      banner: BANNERS[4],
      status: 'published',
      type: 'in-person',
      isFeatured: false,
      isTrending: true,
      venue: { name: 'HITEX Exhibition Centre', address: 'Izzat Nagar, Madhapur', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      startDate: day(45),
      endDate: day(46),
      timezone: 'Asia/Kolkata',
      maxAttendees: 2000,
      registeredCount: 1680,
      ticketTypes: [
        { name: 'Founder Pass', description: 'Full conclave access + pitch competition entry', price: 1999, quantity: 1200, sold: 980, maxPerBooking: 2 },
        { name: 'Investor Pass', description: 'Exclusive investor lounge + deal flow sessions (invitation required)', price: 0, quantity: 300, sold: 248, maxPerBooking: 1 },
        { name: 'Student Entrepreneur', description: 'Discounted access for college students + mentorship session', price: 499, quantity: 500, sold: 452, maxPerBooking: 1 },
      ],
      certificateEnabled: true,
      networkingEnabled: true,
      waitlistEnabled: false,
      'stats.views': 34200,
      'stats.avgRating': 4.8,
      'stats.reviewCount': 167,
    },
    {
      title: 'React & Next.js Masterclass India',
      description: 'An intensive full-day online workshop designed for Indian developers who want to master modern React 19 and Next.js 15. Led by senior engineers from top Indian product companies (Swiggy, Razorpay, CRED), this workshop covers React Server Components, Partial Pre-rendering, advanced Zustand patterns, testing with Vitest and Playwright, edge deployments, and performance optimization with Lighthouse CI. You\'ll build a production-grade Indian fintech app from scratch. All sessions in English with Hindi Q&A option. Certificate of completion provided.',
      shortDescription: 'Master React 19 & Next.js 15 with engineers from Swiggy, Razorpay & CRED.',
      organizer: organizer._id,
      category: eduCat._id,
      tags: ['react', 'nextjs', 'javascript', 'workshop', 'frontend', 'india', 'webdev'],
      banner: BANNERS[5],
      status: 'published',
      type: 'virtual',
      isFeatured: false,
      isTrending: true,
      venue: { virtualLink: 'https://zoom.us/j/reactindia2026' },
      startDate: day(14),
      endDate: day(14),
      timezone: 'Asia/Kolkata',
      maxAttendees: 500,
      registeredCount: 487,
      ticketTypes: [
        { name: 'Workshop Ticket', description: 'Full-day workshop access + 90-day recordings + certificate', price: 999, quantity: 500, sold: 487, maxPerBooking: 3 },
      ],
      certificateEnabled: true,
      networkingEnabled: true,
      waitlistEnabled: true,
      'stats.views': 18600,
      'stats.avgRating': 4.9,
      'stats.reviewCount': 203,
    },
    {
      title: 'Pune International Food Festival',
      description: 'The most delicious event of the year returns to Pune! Explore over 200 food stalls representing 35+ cuisines from across India and the world. Featured highlights include a Maharashtrian street food trail, live cooking masterclasses with celebrity chefs Ranveer Brar and Kunal Kapur, a craft beer and wine garden, vegan and sustainable food village, midnight food market, and a competitive eating championship. Live music by local indie bands playing across four stages throughout the day. Family-friendly with dedicated kids\' cooking workshops.',
      shortDescription: '200+ stalls, celebrity chefs, craft beer garden, and India\'s tastiest 3-day food festival.',
      organizer: organizer._id,
      category: foodCat._id,
      tags: ['food', 'festival', 'pune', 'chefs', 'street-food', 'india', 'culinary'],
      banner: BANNERS[6],
      status: 'published',
      type: 'in-person',
      isFeatured: false,
      isTrending: true,
      venue: { name: 'Amanora Town Centre Grounds', address: 'Hadapsar', city: 'Pune', state: 'Maharashtra', country: 'India' },
      startDate: day(28),
      endDate: day(30),
      timezone: 'Asia/Kolkata',
      maxAttendees: 30000,
      registeredCount: 22400,
      ticketTypes: [
        { name: '1-Day Entry', description: 'Access for a single day of your choice + welcome food coupon', price: 299, quantity: 25000, sold: 19800, maxPerBooking: 8 },
        { name: '3-Day Pass', description: 'All 3 days unlimited access + exclusive goodie bag', price: 699, quantity: 5000, sold: 2600, maxPerBooking: 4 },
      ],
      certificateEnabled: false,
      networkingEnabled: false,
      waitlistEnabled: false,
      'stats.views': 74800,
      'stats.avgRating': 4.7,
      'stats.reviewCount': 521,
    },
    {
      title: 'Digital India Summit — New Delhi',
      description: 'The flagship annual summit on India\'s digital transformation journey, hosted by the Digital India Foundation. This three-day summit brings together policy makers, tech leaders, IAS officers, and entrepreneurs to discuss IndiaStack evolution, ONDC, UPI 3.0, Digital Rupee, AI governance frameworks, and rural digital inclusion. Inaugurated by senior ministers with keynotes from NASSCOM, Google India, and Microsoft India leaders. Features 40+ panel discussions, startup policy clinics, and exclusive launches of new government digital initiatives. Press-accredited event — limited seats available.',
      shortDescription: 'India\'s premier digital policy summit — ministers, tech leaders, and IndiaStack innovations.',
      organizer: organizer._id,
      category: techCat._id,
      tags: ['digital-india', 'policy', 'technology', 'delhi', 'government', 'startup', 'indiastack'],
      banner: BANNERS[7],
      status: 'published',
      type: 'hybrid',
      isFeatured: true,
      isTrending: false,
      venue: { name: 'Vigyan Bhavan', address: 'Maulana Azad Road, New Delhi', city: 'New Delhi', state: 'Delhi', country: 'India', virtualLink: 'https://digitalindiasummit.gov.in/live' },
      startDate: day(55),
      endDate: day(57),
      timezone: 'Asia/Kolkata',
      maxAttendees: 3000,
      registeredCount: 2180,
      ticketTypes: [
        { name: 'Delegate Pass', description: 'Full summit access + delegate kit + all meals', price: 4999, quantity: 2000, sold: 1620, maxPerBooking: 2 },
        { name: 'Virtual Delegate', description: 'Live stream access + on-demand recordings + digital kit', price: 999, quantity: 5000, sold: 3800, maxPerBooking: 5 },
        { name: 'Government / NGO', description: 'Subsidized rate for government officials and NGO representatives', price: 0, quantity: 500, sold: 342, maxPerBooking: 1 },
      ],
      certificateEnabled: true,
      networkingEnabled: true,
      waitlistEnabled: true,
      'stats.views': 41200,
      'stats.avgRating': 4.7,
      'stats.reviewCount': 156,
    },
  ];

  const eventsToCreate = EVENTS.map(({ 'stats.views': views, 'stats.avgRating': avgRating, 'stats.reviewCount': reviewCount, ...rest }) => ({
    ...rest,
    stats: { views: views || 0, avgRating: avgRating || 0, reviewCount: reviewCount || 0, revenue: 0, bookmarks: 0 },
  }));

  const events = await Event.create(eventsToCreate);
  console.log(`Created ${events.length} events`);

  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts:');
  USERS.forEach(u => console.log(`  ${u.role.padEnd(10)} ${u.email}  /  ${u.password}`));
  console.log('\nRun: npm run dev (in backend dir) and npm run dev (in frontend dir)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => { console.error('Seed failed:', err); process.exit(1); });

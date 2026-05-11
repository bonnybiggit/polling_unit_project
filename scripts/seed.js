const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Admin = require('../models/admin.model');
const Voter = require('../models/voter.model');
const Candidate = require('../models/candidate.model');
const Position = require('../models/position.model');
const Election = require('../models/election.model');
const PollingUnit = require('../models/pollingUnit.model');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const MONGODB_URI = process.env.MONGODB_URI;

async function connect() {
  await mongoose.connect(MONGODB_URI, { autoIndex: false, maxPoolSize: 20, serverSelectionTimeoutMS: 5000 });
}

async function seed() {
  await connect();
  console.log('Connected to MongoDB for seeding.');

  await Promise.all([
    Admin.deleteMany({}),
    Voter.deleteMany({}),
    Candidate.deleteMany({}),
    Position.deleteMany({}),
    Election.deleteMany({}),
    PollingUnit.deleteMany({}),
  ]);

  const positions = await Position.insertMany([
    { title: 'President', slug: 'president' },
    { title: 'Governor', slug: 'governor' },
    { title: 'Senator', slug: 'senator' },
    { title: 'House of Representatives', slug: 'house-of-representatives' },
    { title: 'Chairman', slug: 'chairman' },
    { title: 'Councillor', slug: 'councillor' },
  ]);

  const pollingUnit = await PollingUnit.create({ name: 'Central Civic Center', code: 'PU-001', state: 'Lagos', localGovernment: 'Eti-Osa', address: '22 Civic Road', zone: 'Zone A' });

  const voters = await Voter.insertMany([
    { firstName: 'Amina', lastName: 'Bello', cardNumber: '2211034501', pollingUnit: pollingUnit._id, status: 'active' },
    { firstName: 'Chike', lastName: 'Nwosu', cardNumber: '2211034502', pollingUnit: pollingUnit._id, status: 'active' },
  ]);

  const candidates = await Candidate.insertMany([
    { name: 'Amina Bello', party: 'Unity Front', position: positions.find((pos) => pos.slug === 'president')._id, bio: 'National leader with public trust.' },
    { name: 'Chike Nwosu', party: 'Progress Alliance', position: positions.find((pos) => pos.slug === 'president')._id, bio: 'Experienced in infrastructure and governance.' },
  ]);

  await Election.create({ name: 'General Election 2026', status: 'open', positions: positions.map((position) => position._id), startDate: new Date(), metadata: { phase: 'initial' } });
  await Admin.create({ email: 'admin@pollingunit.gov', password: process.env.ADMIN_PASSWORD || 'SecureAdminPassword123!', role: 'super-admin', name: 'System Administrator' });

  console.log('Seed data created successfully.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

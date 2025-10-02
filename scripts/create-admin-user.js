#!/usr/bin/env node
require('dotenv').config({ path: '.env.local', override: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Lazy import Admin model in CJS
let AdminModel;
try {
  // models/Admin.js is ESM default export; require will attach model to mongoose.models
  AdminModel = require('../models/Admin');
  AdminModel = AdminModel.default || mongoose.model('Admin');
} catch (e) {
  AdminModel = mongoose.model('Admin');
}

function generateUniqueId(prefix) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}${ts}${rand}`;
}

async function main() {
  console.log('🚀 Starting Admin Creation Script');
  console.log('=====================================');

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const email = process.env.ADMIN_EMAIL || 'admin@cancercare.com';

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not set in .env.local');
    process.exit(1);
  }

  console.log('📡 Connecting to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('❌ Error creating admin user: Database connection failed:', err.message);
    console.log('💡 This error suggests a database connection issue');
    console.log('   - Check your MongoDB Atlas IP whitelist');
    console.log('   - Verify your MONGODB_URI is correct');
    process.exit(1);
  }

  try {
    console.log('🔍 Checking for existing admin users...');
    let existing = await AdminModel.findOne({ username });
    if (existing) {
      console.log('ℹ️  Admin already exists:', existing.username, existing.adminId || existing._id.toString());
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
      process.exit(0);
    }

    console.log('👤 Creating new admin user...');
    const adminId = generateUniqueId('ADM');
    console.log('🔐 Hashing password...');
    const hash = await bcrypt.hash(password, 12);

    const admin = new AdminModel({
      adminId,
      username,
      email,
      password: hash,
      role: 'admin'
    });

    console.log('💾 Saving admin user to database...');
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('=====================================');
    console.log('📋 Admin Details:');
    console.log(`   Admin ID: ${admin.adminId}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created: ${new Date().toString()}`);
    console.log('=====================================');
    console.log('🔑 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('🌐 You can now login at: http://localhost:3000/admin/login');
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

main();

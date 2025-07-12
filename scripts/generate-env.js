#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Environment Variables Generator');
console.log('=====================================\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate a random string for other secrets
const randomSecret = crypto.randomBytes(32).toString('hex');
console.log('Random Secret (for other uses):');
console.log(randomSecret);
console.log('');

// Generate database password
const dbPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
console.log('Database Password:');
console.log(dbPassword);
console.log('');

console.log('📝 Next Steps:');
console.log('1. Copy these values to your .env file');
console.log('2. Follow ENVIRONMENT_SETUP.md for other variables');
console.log('3. Never commit .env files to version control');
console.log('');

console.log('🔗 Quick Links:');
console.log('- RunwayML API: https://runwayml.com');
console.log('- Instagram App: https://developers.facebook.com');
console.log('- Cloudinary: https://cloudinary.com');
console.log('- Vercel Postgres: https://vercel.com/dashboard');
console.log('- Upstash Redis: https://upstash.com');
console.log('- Sentry: https://sentry.io'); 
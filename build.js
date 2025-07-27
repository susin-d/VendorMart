#!/usr/bin/env node
// Simple build script for static deployment
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('Building VendorMate for static deployment...');
  
  // Change to client directory and build
  process.chdir(join(__dirname, 'client'));
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Files are in dist/public/');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
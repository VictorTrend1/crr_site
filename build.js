#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting build process...');

try {
  // Set environment variable for OpenSSL legacy provider
  process.env.NODE_OPTIONS = '--openssl-legacy-provider';
  
  // Make sure react-scripts is executable
  const reactScriptsPath = path.join(__dirname, 'node_modules', '.bin', 'react-scripts');
  if (fs.existsSync(reactScriptsPath)) {
    try {
      fs.chmodSync(reactScriptsPath, '755');
      console.log('Set permissions for react-scripts');
    } catch (err) {
      console.log('Could not set permissions, continuing...');
    }
  }
  
  // Run the build using node directly
  console.log('Running react-scripts build...');
  const buildCommand = `node "${path.join(__dirname, 'node_modules', 'react-scripts', 'scripts', 'build.js')}"`;
  execSync(buildCommand, { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider' }
  });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

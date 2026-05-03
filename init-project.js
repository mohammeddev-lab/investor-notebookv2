// Project initialization script - creates all necessary directories and files

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();

// Create directory structure
const dirs = [
  'app',
  'app/api',
  'app/api/types',
  'app/api/records',
  'app/api/upload',
  'pages',
  'components',
  'lib',
  'public',
  'public/images',
  'public/images/defaults',
  'data',
  'scripts',
];

dirs.forEach(dir => {
  const fullPath = path.join(projectRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

console.log('✅ Project structure initialized successfully!');

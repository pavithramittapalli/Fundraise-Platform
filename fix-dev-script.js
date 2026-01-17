const fs = require('fs');
const path = require('path');

// Read the current package.json
const packagePath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Fix the dev script for Windows
packageJson.scripts.dev = 'npx tsx server.ts';
packageJson.scripts['dev:watch'] = 'nodemon --exec "npx tsx server.ts" --watch server.ts --watch src --ext ts,tsx,js,jsx';

// Write the fixed package.json
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

console.log('✅ Fixed dev script for Windows!');
console.log('Now run: npm run dev');
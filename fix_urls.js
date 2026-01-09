const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend/my-react-app/src');
const oldUrl = 'http://localhost:5000';
const newUrl = 'https://crm-backend-w02x.onrender.com';

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            scanDir(filePath);
        } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (content.includes(oldUrl)) {
                console.log(`Fixing ${file}...`);
                const newContent = content.split(oldUrl).join(newUrl);
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
        }
    });
}

console.log('Starting URL Fix...');
scanDir(targetDir);
console.log('Done!');

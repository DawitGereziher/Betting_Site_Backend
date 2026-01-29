
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
    console.log('Creating dummy .env for build process...');
    // We provide a syntactically valid URL just to satisfy validation schema if strict
    // but Prisma generate usually doesn't connect.
    const content = 'DATABASE_URL="mysql://dummy:dummy@localhost:3306/dummy"';
    fs.writeFileSync(envPath, content);
} else {
    console.log('.env already exists, skipping creation.');
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const apiRoutes = require('./api/routes');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('✅ Created uploads directory');
}

// 2. Mount API routes
// This means every route in routes.js is now prefixed with /api
app.use('/api', apiRoutes);

// 3. Root health check
app.get('/', (req, res) => res.send('Edura AI Backend is running.'));

app.listen(port, () => {
    console.log(`\n🚀 Server is running on http://localhost:${port}`);
    console.log(`📡 Endpoints active:`);
    console.log(`   - POST http://localhost:${port}/api/auth/signup`);
    console.log(`   - POST http://localhost:${port}/api/auth/login`);
    console.log(`   - POST http://localhost:${port}/api/user/verify-document\n`);
});
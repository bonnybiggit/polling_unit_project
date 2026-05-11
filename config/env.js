const dotenv = require('dotenv');
const path = require('path');

function initEnvironment() {
  const envPath = path.resolve(process.cwd(), '.env');
  dotenv.config({ path: envPath });

  const required = ['MONGODB_URI', 'JWT_SECRET'];
  required.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });
}

module.exports = { initEnvironment };

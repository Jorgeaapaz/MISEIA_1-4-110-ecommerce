// Set test environment variables before any test runs
process.env.AUTH_SECRET = 'test_secret_32_chars_for_vitest!!';
process.env.MONGODB_URI = 'mongodb://localhost:27017';
process.env.MONGODB_DB = 'ecommerce_test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

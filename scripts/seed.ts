import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'ecommerce';

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  console.log('🌱 Seeding database...');

  // Drop existing collections
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.dropCollection(col.name);
  }
  console.log('  ✓ Cleared existing data');

  // Create admin user
  const adminHash = await bcrypt.hash('admin123', 10);
  const adminResult = await db.collection('users').insertOne({
    email: 'admin@shop.com',
    passwordHash: adminHash,
    role: 'admin',
    name: 'Admin User',
    createdAt: new Date(),
  });
  console.log('  ✓ Created admin user: admin@shop.com / admin123');

  // Create 5 customer users
  const customerHash = await bcrypt.hash('pass1234', 10);
  const customerIds: ObjectId[] = [];

  for (let i = 1; i <= 5; i++) {
    const result = await db.collection('users').insertOne({
      email: `customer${i}@shop.com`,
      passwordHash: customerHash,
      role: 'customer',
      name: `Customer ${i}`,
      createdAt: new Date(Date.now() - (5 - i) * 86400000),
    });
    customerIds.push(result.insertedId);
  }
  console.log('  ✓ Created 5 customer users: customer1@shop.com ... customer5@shop.com / pass1234');

  // Create 15 products across 3 categories
  const products = [
    // Electronics (5)
    { name: 'Wireless Bluetooth Headphones', description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.', price: 7999, stock: 50, category: 'Electronics', active: true },
    { name: 'USB-C Fast Charger', description: 'Compact 65W GaN charger with dual USB-C ports. Compatible with laptops, tablets, and phones.', price: 3499, stock: 120, category: 'Electronics', active: true },
    { name: 'Mechanical Keyboard', description: 'Compact 75% layout mechanical keyboard with hot-swappable switches and RGB backlighting.', price: 8999, stock: 35, category: 'Electronics', active: true },
    { name: 'Portable SSD 1TB', description: 'Ultra-fast external solid state drive with read speeds up to 1050MB/s. Shock-resistant and pocket-sized.', price: 10999, stock: 25, category: 'Electronics', active: true },
    { name: 'Smart LED Desk Lamp', description: 'Adjustable color temperature desk lamp with touch controls and USB charging port.', price: 4599, stock: 60, category: 'Electronics', active: true },

    // Books (5)
    { name: 'Clean Code', description: 'A handbook of agile software craftsmanship by Robert C. Martin. Essential reading for every developer.', price: 3299, stock: 80, category: 'Books', active: true },
    { name: 'Design Patterns', description: 'Elements of reusable object-oriented software. The classic Gang of Four book on software design.', price: 4199, stock: 45, category: 'Books', active: true },
    { name: 'The Pragmatic Programmer', description: 'Your journey to mastery. Updated 20th anniversary edition with fresh insights and modern examples.', price: 3899, stock: 55, category: 'Books', active: true },
    { name: 'System Design Interview', description: 'An insider guide to system design interviews. Covers distributed systems, caching, and scalability.', price: 2999, stock: 100, category: 'Books', active: true },
    { name: 'Refactoring', description: 'Improving the design of existing code by Martin Fowler. Second edition with JavaScript examples.', price: 3599, stock: 40, category: 'Books', active: true },

    // Home (5)
    { name: 'Ceramic Pour-Over Coffee Set', description: 'Handcrafted ceramic dripper with double-wall glass carafe. Brews 2-4 cups of perfect coffee.', price: 5499, stock: 30, category: 'Home', active: true },
    { name: 'Bamboo Desk Organizer', description: 'Multi-compartment bamboo organizer with phone stand, pen holder, and cable management slots.', price: 2499, stock: 75, category: 'Home', active: true },
    { name: 'Scented Soy Candle Set', description: 'Set of 3 hand-poured soy wax candles in cedar, lavender, and vanilla. 40-hour burn time each.', price: 2999, stock: 90, category: 'Home', active: true },
    { name: 'Minimalist Wall Clock', description: 'Silent quartz movement wall clock with clean design. 12-inch diameter, perfect for any room.', price: 3999, stock: 40, category: 'Home', active: true },
    { name: 'Cotton Throw Blanket', description: 'Premium 100% organic cotton blanket in a herringbone weave pattern. Machine washable, ultra soft.', price: 4499, stock: 50, category: 'Home', active: true },
  ];

  const productResults = await db.collection('products').insertMany(products);
  const productIds = Object.values(productResults.insertedIds);
  console.log('  ✓ Created 15 products across 3 categories');

  // Create 5 sample orders
  const sampleOrders = [
    {
      customerId: customerIds[0],
      items: [
        { productId: productIds[0], name: products[0].name, qty: 1, unitPrice: products[0].price },
        { productId: productIds[5], name: products[5].name, qty: 2, unitPrice: products[5].price },
      ],
      total: products[0].price + products[5].price * 2,
      status: 'paid',
      stripeSessionId: 'cs_test_sample_001',
      createdAt: new Date(Date.now() - 4 * 86400000),
    },
    {
      customerId: customerIds[1],
      items: [
        { productId: productIds[2], name: products[2].name, qty: 1, unitPrice: products[2].price },
      ],
      total: products[2].price,
      status: 'shipped',
      stripeSessionId: 'cs_test_sample_002',
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
    {
      customerId: customerIds[2],
      items: [
        { productId: productIds[10], name: products[10].name, qty: 1, unitPrice: products[10].price },
        { productId: productIds[12], name: products[12].name, qty: 3, unitPrice: products[12].price },
      ],
      total: products[10].price + products[12].price * 3,
      status: 'pending',
      stripeSessionId: null,
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
    {
      customerId: customerIds[0],
      items: [
        { productId: productIds[3], name: products[3].name, qty: 1, unitPrice: products[3].price },
        { productId: productIds[7], name: products[7].name, qty: 1, unitPrice: products[7].price },
        { productId: productIds[11], name: products[11].name, qty: 2, unitPrice: products[11].price },
      ],
      total: products[3].price + products[7].price + products[11].price * 2,
      status: 'paid',
      stripeSessionId: 'cs_test_sample_004',
      createdAt: new Date(Date.now() - 1 * 86400000),
    },
    {
      customerId: customerIds[3],
      items: [
        { productId: productIds[8], name: products[8].name, qty: 1, unitPrice: products[8].price },
      ],
      total: products[8].price,
      status: 'cancelled',
      stripeSessionId: 'cs_test_sample_005',
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
  ];

  await db.collection('orders').insertMany(sampleOrders);
  console.log('  ✓ Created 5 sample orders (paid, shipped, pending, paid, cancelled)');

  // Create indexes
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('products').createIndex({ category: 1 });
  await db.collection('products').createIndex({ active: 1 });
  await db.collection('orders').createIndex({ customerId: 1 });
  await db.collection('orders').createIndex({ status: 1 });
  await db.collection('carts').createIndex({ customerId: 1 }, { unique: true });
  console.log('  ✓ Created database indexes');

  await client.close();
  console.log('\n✅ Seed completed successfully!');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

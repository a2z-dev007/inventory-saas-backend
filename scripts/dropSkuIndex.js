const mongoose = require('mongoose');

// Update this with your actual MongoDB connection string if needed
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventory_management';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', async () => {
  try {
    const result = await mongoose.connection.db.collection('products').dropIndex('sku_1');
    console.log('Dropped sku_1 index:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('sku_1 index does not exist.');
    } else {
      console.error('Error dropping sku_1 index:', err);
    }
  }
  process.exit(0);
});
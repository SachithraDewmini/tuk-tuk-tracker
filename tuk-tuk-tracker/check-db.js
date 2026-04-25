const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('tuk_tuk_tracker');
    
    console.log('\n📊 DATABASE SUMMARY');
    console.log('='.repeat(40));
    
    const collections = ['provinces', 'districts', 'policeStations', 'users', 'vehicles', 'locationPings'];
    
    for (const collection of collections) {
      const count = await db.collection(collection).countDocuments();
      console.log(collection.padEnd(20) + ': ' + count.toLocaleString());
    }
    
    console.log('='.repeat(40));
    
    const vehicleCount = await db.collection('vehicles').countDocuments();
    if (vehicleCount === 0) {
      console.log('\n⚠️  Database is empty! Run: npm run seed');
    } else {
      console.log('\n✅ Database has data!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure MongoDB is running: net start MongoDB');
  } finally {
    await client.close();
  }
}

checkDatabase();

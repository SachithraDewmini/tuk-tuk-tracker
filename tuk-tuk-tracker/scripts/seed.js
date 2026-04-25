const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🌱 Seeding database with complete data...\n');
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('provinces').deleteMany({});
    await db.collection('districts').deleteMany({});
    await db.collection('policeStations').deleteMany({});
    await db.collection('vehicles').deleteMany({});
    await db.collection('locationPings').deleteMany({});
    
    // ==================== 1. CREATE 9 PROVINCES ====================
    const provinces = [
      'Western', 'Central', 'Southern', 'Northern', 'Eastern',
      'North Western', 'North Central', 'Uva', 'Sabaragamuwa'
    ];
    
    const provinceDocs = [];
    for (const name of provinces) {
      const result = await db.collection('provinces').insertOne({ name });
      provinceDocs.push({ id: result.insertedId, name });
    }
    console.log(`✅ Created ${provinceDocs.length} provinces`);
    
    // ==================== 2. CREATE 25 DISTRICTS ====================
    const districtMapping = {
      'Western': ['Colombo', 'Gampaha', 'Kalutara'],
      'Central': ['Kandy', 'Matale', 'Nuwara Eliya'],
      'Southern': ['Galle', 'Matara', 'Hambantota'],
      'Northern': ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
      'Eastern': ['Trincomalee', 'Batticaloa', 'Ampara'],
      'North Western': ['Kurunegala', 'Puttalam'],
      'North Central': ['Anuradhapura', 'Polonnaruwa'],
      'Uva': ['Badulla', 'Monaragala'],
      'Sabaragamuwa': ['Ratnapura', 'Kegalle']
    };
    
    const districtDocs = [];
    for (const province of provinceDocs) {
      const districts = districtMapping[province.name] || [];
      for (const districtName of districts) {
        const result = await db.collection('districts').insertOne({
          name: districtName,
          provinceId: province.id
        });
        districtDocs.push({ 
          id: result.insertedId, 
          name: districtName, 
          provinceId: province.id, 
          provinceName: province.name 
        });
      }
    }
    console.log(`✅ Created ${districtDocs.length} districts`);
    
    // ==================== 3. CREATE 20+ POLICE STATIONS ====================
    const policeStationsData = [
      // Western Province
      { name: 'Colombo Fort Police Station', district: 'Colombo' },
      { name: 'Pettah Police Station', district: 'Colombo' },
      { name: 'Borella Police Station', district: 'Colombo' },
      { name: 'Narahenpita Police Station', district: 'Colombo' },
      { name: 'Gampaha Police Station', district: 'Gampaha' },
      { name: 'Negombo Police Station', district: 'Gampaha' },
      { name: 'Kalutara Police Station', district: 'Kalutara' },
      { name: 'Panadura Police Station', district: 'Kalutara' },
      // Central Province
      { name: 'Kandy Police Station', district: 'Kandy' },
      { name: 'Matale Police Station', district: 'Matale' },
      { name: 'Nuwara Eliya Police Station', district: 'Nuwara Eliya' },
      // Southern Province
      { name: 'Galle Police Station', district: 'Galle' },
      { name: 'Matara Police Station', district: 'Matara' },
      { name: 'Hambantota Police Station', district: 'Hambantota' },
      // Northern Province
      { name: 'Jaffna Police Station', district: 'Jaffna' },
      { name: 'Kilinochchi Police Station', district: 'Kilinochchi' },
      // Eastern Province
      { name: 'Trincomalee Police Station', district: 'Trincomalee' },
      { name: 'Batticaloa Police Station', district: 'Batticaloa' },
      // North Western
      { name: 'Kurunegala Police Station', district: 'Kurunegala' },
      { name: 'Puttalam Police Station', district: 'Puttalam' },
      // North Central
      { name: 'Anuradhapura Police Station', district: 'Anuradhapura' },
      { name: 'Polonnaruwa Police Station', district: 'Polonnaruwa' }
    ];
    
    const policeStationDocs = [];
    for (const station of policeStationsData) {
      const district = districtDocs.find(d => d.name === station.district);
      if (district) {
        const result = await db.collection('policeStations').insertOne({
          name: station.name,
          districtId: district.id,
          phone: `011-${Math.floor(1000000 + Math.random() * 9000000)}`,
          address: `${station.name}, ${station.district}`,
          createdAt: new Date()
        });
        policeStationDocs.push(result.insertedId);
      }
    }
    console.log(`✅ Created ${policeStationDocs.length} police stations`);
    
    // ==================== 4. CREATE USERS WITH DIFFERENT ROLES ====================
    const users = [
      {
        username: 'hq_admin',
        password: 'Admin@123',
        name: 'HQ Administrator',
        role: 'HQ',
        isActive: true
      }
    ];
    
    // Provincial users
    for (const province of provinceDocs) {
      users.push({
        username: `${province.name.toLowerCase().replace(/ /g, '_')}_admin`,
        password: 'Province@123',
        name: `${province.name} Provincial Admin`,
        role: 'PROVINCIAL',
        provinceId: province.id,
        isActive: true
      });
    }
    
    // Station users
    for (let i = 0; i < 15; i++) {
      const station = policeStationsData[i];
      const district = districtDocs.find(d => d.name === station.district);
      if (district) {
        users.push({
          username: `station_${station.name.toLowerCase().replace(/ /g, '_')}`,
          password: 'Station@123',
          name: `${station.name} User`,
          role: 'STATION',
          districtId: district.id,
          isActive: true
        });
      }
    }
    
    for (const user of users) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await db.collection('users').insertOne({
        ...user,
        passwordHash,
        createdAt: new Date(),
        lastLoginAt: null
      });
    }
    console.log(`✅ Created ${users.length} users`);
    
    // ==================== 5. CREATE 200 VEHICLES ====================
    const vehicleDocs = [];
    const prefixes = ['ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQR', 'STU', 'VWX', 'YZA', 'BCD'];
    
    for (let i = 1; i <= 200; i++) {
      const district = districtDocs[Math.floor(Math.random() * districtDocs.length)];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      const vehicle = {
        registrationNumber: `${prefix}-${String(i).padStart(4, '0')}`,
        deviceId: `TUK_${String(i).padStart(6, '0')}`,
        ownerName: `Vehicle Owner ${i}`,
        ownerNic: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
        ownerPhone: `07${Math.floor(Math.random() * 70000000) + 10000000}`,
        districtId: district.id,
        districtName: district.name,
        provinceName: district.provinceName,
        isActive: Math.random() > 0.1,
        currentLocation: null,
        createdAt: new Date(Date.now() - Math.random() * 365 * 86400000),
        updatedAt: new Date()
      };
      
      const result = await db.collection('vehicles').insertOne(vehicle);
      vehicleDocs.push({ id: result.insertedId, ...vehicle });
    }
    console.log(`✅ Created ${vehicleDocs.length} vehicles`);
    
    // ==================== 6. GENERATE 7 DAYS LOCATION HISTORY ====================
    console.log('🔄 Generating 7 days of location history (this may take a minute)...');
    
    const districtCenters = {
      'Colombo': { lat: 6.9271, lng: 79.8612 },
      'Gampaha': { lat: 7.0898, lng: 79.9920 },
      'Kalutara': { lat: 6.5854, lng: 79.9595 },
      'Kandy': { lat: 7.2906, lng: 80.6339 },
      'Matale': { lat: 7.4674, lng: 80.6237 },
      'Nuwara Eliya': { lat: 6.9708, lng: 80.7850 },
      'Galle': { lat: 6.0324, lng: 80.2173 },
      'Matara': { lat: 5.9489, lng: 80.5481 },
      'Hambantota': { lat: 6.1241, lng: 81.1187 },
      'Jaffna': { lat: 9.6615, lng: 80.0255 },
      'Kurunegala': { lat: 7.4863, lng: 80.3646 },
      'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
      'Badulla': { lat: 6.9934, lng: 81.0550 },
      'Ratnapura': { lat: 6.7055, lng: 80.3847 }
    };
    
    const pings = [];
    const startDate = new Date(Date.now() - 7 * 86400000);
    
    for (const vehicle of vehicleDocs) {
      const center = districtCenters[vehicle.districtName] || { lat: 7.0, lng: 80.0 };
      
      // Generate ping every 15 minutes for 7 days (4 per hour = 672 per vehicle)
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 15) {
            // Add realistic movement pattern
            const hourOfDay = hour;
            let activityFactor = 1;
            
            // More movement during day (6 AM - 8 PM)
            if (hourOfDay >= 6 && hourOfDay <= 20) {
              activityFactor = 1.5;
            } else {
              activityFactor = 0.3;
            }
            
            const latOffset = (Math.random() - 0.5) * 0.02 * activityFactor;
            const lngOffset = (Math.random() - 0.5) * 0.02 * activityFactor;
            
            pings.push({
              vehicleId: vehicle.id,
              lat: center.lat + latOffset,
              lng: center.lng + lngOffset,
              speed: Math.random() * 60 * activityFactor,
              direction: Math.random() * 360,
              timestamp: new Date(startDate.getTime() + day * 86400000 + hour * 3600000 + minute * 60000)
            });
          }
        }
      }
    }
    
    // Batch insert pings for better performance
    const batchSize = 5000;
    for (let i = 0; i < pings.length; i += batchSize) {
      const batch = pings.slice(i, i + batchSize);
      await db.collection('locationPings').insertMany(batch);
    }
    console.log(`✅ Created ${pings.length.toLocaleString()} location pings`);
    
    // Update vehicles with latest ping as current location
    for (const vehicle of vehicleDocs) {
      const latestPing = await db.collection('locationPings')
        .find({ vehicleId: vehicle.id })
        .sort({ timestamp: -1 })
        .limit(1)
        .next();
      
      if (latestPing) {
        await db.collection('vehicles').updateOne(
          { _id: vehicle.id },
          { 
            $set: { 
              currentLocation: {
                lat: latestPing.lat,
                lng: latestPing.lng,
                speed: latestPing.speed,
                direction: latestPing.direction,
                timestamp: latestPing.timestamp
              }
            }
          }
        );
      }
    }
    
    console.log('\n🎉 Seeding completed successfully!');
    console.log('📊 Database Summary:');
    console.log(`   - ${provinceDocs.length} provinces`);
    console.log(`   - ${districtDocs.length} districts`);
    console.log(`   - ${policeStationDocs.length} police stations`);
    console.log(`   - ${users.length} users (HQ, Provincial, Station)`);
    console.log(`   - ${vehicleDocs.length} vehicles`);
    console.log(`   - ${pings.length.toLocaleString()} location records (7 days history)`);
    console.log('\n👥 Test Users:');
    console.log('   HQ Admin:     username: hq_admin, password: Admin@123');
    console.log('   Provincial:   username: western_admin, password: Province@123');
    console.log('   Station:      username: station_colombo_fort_police_station, password: Station@123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await client.close();
  }
}

seed();
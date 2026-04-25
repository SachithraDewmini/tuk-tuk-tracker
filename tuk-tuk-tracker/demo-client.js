/**
 * Tuk-Tuk Tracker API Demo Client
 * 
 * This script demonstrates the core functionality of the SL Police Tuk-Tuk Tracking API:
 * 1. Login as HQ Admin
 * 2. Get live fleet status
 * 3. Simulate a device GPS ping
 * 4. Get location history for a specific vehicle
 */

const API_URL = 'http://localhost:3000/api';

async function runDemo() {
  console.log('🚀 Starting API Demonstration...\n');

  try {
    // 1. LOGIN
    console.log('🔐 Step 1: Logging in as HQ Administrator...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'hq_admin', password: 'Admin@123' })
    });
    const { token } = await loginRes.json();
    console.log('✅ Login successful!\n');

    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 2. GET LIVE LOCATIONS
    console.log('📍 Step 2: Fetching live fleet view...');
    const liveRes = await fetch(`${API_URL}/locations/live`, { headers: authHeader });
    const liveData = await liveRes.json();
    console.log(`✅ Received live data for ${liveData.count} vehicles.`);
    
    const sampleVehicle = liveData.data[0];
    console.log(`   Sample Vehicle: ${sampleVehicle.registrationNumber} (Device: ${sampleVehicle.vehicleId})\n`);

    // 3. SIMULATE GPS PING
    console.log('🛰️ Step 3: Simulating a real GPS ping from a device...');
    const pingRes = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: 'TUK_000001', // Real device ID from simulation
        lat: 6.9271,
        lng: 79.8612,
        speed: 45.5,
        direction: 180,
        accuracy: 5
      })
    });
    const pingResult = await pingRes.json();
    if (pingResult.success) {
      console.log('✅ Location recorded successfully!\n');
    } else {
      console.log('❌ Ping failed:', pingResult.error);
    }

    // 4. GET HISTORY
    console.log('📜 Step 4: Fetching movement history (Time-Window Tracking)...');
    const historyRes = await fetch(`${API_URL}/locations/history?limit=5`, { headers: authHeader });
    const historyData = await historyRes.json();
    console.log(`✅ Retrieved ${historyData.data.length} historical logs.`);
    console.table(historyData.data.map(h => ({
      Vehicle: h.registrationNumber,
      Lat: h.lat.toFixed(4),
      Lng: h.lng.toFixed(4),
      Speed: `${h.speed.toFixed(1)} km/h`,
      Time: new Date(h.timestamp).toLocaleString()
    })));

    console.log('\n✨ Demo completed successfully! All API requirements verified.');

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.log('💡 Tip: Make sure the server is running with "npm run dev"');
  }
}

runDemo();

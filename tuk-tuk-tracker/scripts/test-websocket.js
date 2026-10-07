const { io } = require('socket.io-client');
const axios = require('axios');

async function testWebSocket() {
  console.log('🔄 Authenticating to get token...');
  try {
    // Authenticate as HQ Admin to receive all updates
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'hq_admin',
      password: 'Admin@123'
    });
    const token = response.data.token;
    
    console.log('✅ Authentication successful! Connecting to WebSocket...');
    
    // Connect to WebSocket server
    const socket = io('http://localhost:3000', {
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log(`🟢 Connected to WebSocket Server (ID: ${socket.id})`);
      console.log('⏳ Waiting for location updates... (Run "npm run seed" then "node scripts/simulate.js" in another terminal)');
    });

    socket.on('location_update', (data) => {
      console.log('\n📍 New Location Update Received:');
      console.log(`   Vehicle ID: ${data.vehicleId}`);
      console.log(`   Registration: ${data.registrationNumber}`);
      console.log(`   Coordinates: [${data.location.lat.toFixed(5)}, ${data.location.lng.toFixed(5)}]`);
      console.log(`   Speed: ${data.location.speed.toFixed(1)} km/h`);
      console.log(`   Timestamp: ${data.timestamp}`);
    });

    socket.on('disconnect', () => {
      console.log('🔴 Disconnected from WebSocket server');
    });

    socket.on('connect_error', (err) => {
      console.log(`❌ Connection Error: ${err.message}`);
    });

  } catch (error) {
    console.error('❌ Setup Error:', error.message);
  }
}

testWebSocket();

const axios = require('axios');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:3000/api';
const UPDATE_INTERVAL = 30000; // Send updates every 30 seconds
const VEHICLES_PER_BATCH = 10; // Send 10 vehicles per batch

// Store vehicle data
let vehicles = [];
let authToken = null;
let stats = {
  totalUpdates: 0,
  successfulUpdates: 0,
  failedUpdates: 0,
  startTime: new Date()
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log with colors
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// Helper function to get random number between min and max
function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

// Helper function to generate realistic movement
function generateMovement(lastLat, lastLng, isActive) {
  if (!isActive || !lastLat || !lastLng) {
    // Return random coordinates within Sri Lanka if no previous location
    return {
      lat: randomRange(5.9, 9.8),
      lng: randomRange(79.5, 81.9)
    };
  }
  
  // Simulate realistic movement (max 0.01 degrees change = ~1km)
  const latChange = (Math.random() - 0.5) * 0.01;
  const lngChange = (Math.random() - 0.5) * 0.01;
  
  return {
    lat: Math.max(5.9, Math.min(9.8, lastLat + latChange)),
    lng: Math.max(79.5, Math.min(81.9, lastLng + lngChange))
  };
}

// Helper function to generate realistic speed
function generateSpeed() {
  // Random speed between 0 and 60 km/h
  // With occasional high speeds (highway)
  if (Math.random() < 0.1) {
    return randomRange(40, 80); // High speed (10% chance)
  }
  return randomRange(0, 50); // Normal speed
}

// Get authentication token
async function getAuthToken() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'hq_admin',
      password: 'Admin@123'
    });
    
    authToken = response.data.token;
    log('✅ Authentication successful', colors.green);
    return authToken;
  } catch (error) {
    log(`❌ Authentication failed: ${error.message}`, colors.red);
    throw error;
  }
}

// Fetch all vehicles from the system
async function fetchVehicles() {
  try {
    if (!authToken) {
      await getAuthToken();
    }
    
    const response = await axios.get(`${API_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 300 } // Get all vehicles
    });
    
    vehicles = response.data.data;
    log(`✅ Loaded ${vehicles.length} vehicles from database`, colors.green);
    return vehicles;
  } catch (error) {
    log(`❌ Failed to fetch vehicles: ${error.message}`, colors.red);
    throw error;
  }
}

// Send location update for a single vehicle
async function sendLocationUpdate(vehicle) {
  try {
    if (!authToken) {
      await getAuthToken();
    }
    
    // Generate random movement
    const currentLocation = vehicle.currentLocation;
    const isActive = vehicle.isActive !== false;
    
    const newLocation = generateMovement(
      currentLocation?.lat,
      currentLocation?.lng,
      isActive
    );
    
    const speed = generateSpeed();
    const direction = randomRange(0, 360);
    
    const locationData = {
      deviceId: vehicle.deviceId,
      lat: newLocation.lat,
      lng: newLocation.lng,
      speed: speed,
      direction: direction,
      accuracy: randomRange(5, 20)
    };
    
    // Send location update
    const response = await axios.post(`${API_URL}/locations`, locationData);
    
    if (response.data.success) {
      stats.successfulUpdates++;
      
      // Log only every 10th update to avoid spam
      if (stats.successfulUpdates % 10 === 0) {
        log(`📍 ${vehicle.registrationNumber}: Lat ${newLocation.lat.toFixed(6)}, Lng ${newLocation.lng.toFixed(6)}, Speed: ${speed.toFixed(1)} km/h`, colors.cyan);
      }
      
      return true;
    }
  } catch (error) {
    stats.failedUpdates++;
    if (error.response) {
      log(`❌ Error for ${vehicle.registrationNumber}: ${error.response.data.error || error.message}`, colors.red);
    }
    return false;
  }
}

// Send batch of location updates
async function sendBatchUpdates(batchVehicles) {
  const promises = batchVehicles.map(vehicle => sendLocationUpdate(vehicle));
  const results = await Promise.all(promises);
  stats.totalUpdates += results.length;
  return results.filter(r => r === true).length;
}

// Display simulation statistics
function displayStats() {
  const runtime = (new Date() - stats.startTime) / 1000;
  const minutes = Math.floor(runtime / 60);
  const seconds = Math.floor(runtime % 60);
  
  console.log('\n' + '='.repeat(60));
  log('📊 SIMULATION STATISTICS', colors.bright);
  console.log('='.repeat(60));
  log(`   Runtime:           ${minutes}m ${seconds}s`, colors.yellow);
  log(`   Total Updates:     ${stats.totalUpdates}`, colors.cyan);
  log(`   Successful:        ${stats.successfulUpdates}`, colors.green);
  log(`   Failed:            ${stats.failedUpdates}`, colors.red);
  log(`   Success Rate:      ${((stats.successfulUpdates / stats.totalUpdates) * 100).toFixed(1)}%`, colors.bright);
  console.log('='.repeat(60) + '\n');
}

// Main simulation loop
async function runSimulation() {
  log('\n🚀 Starting Real-Time GPS Simulation for Sri Lanka Police', colors.bright);
  log('=' .repeat(60), colors.bright);
  log(`📡 API URL: ${API_URL}`, colors.blue);
  log(`⏱️  Update Interval: ${UPDATE_INTERVAL / 1000} seconds`, colors.blue);
  log(`🚗 Vehicles Per Batch: ${VEHICLES_PER_BATCH}`, colors.blue);
  log('=' .repeat(60) + '\n', colors.bright);
  
  try {
    // Authenticate
    await getAuthToken();
    
    // Fetch all vehicles
    await fetchVehicles();
    
    if (vehicles.length === 0) {
      log('⚠️  No vehicles found. Please run seed script first: npm run seed', colors.yellow);
      return;
    }
    
    log(`🎯 Starting to simulate ${vehicles.length} vehicles...`, colors.green);
    log(`💡 Updates will be sent every ${UPDATE_INTERVAL / 1000} seconds\n`, colors.cyan);
    
    // Initial batch update
    const randomVehicles = vehicles.sort(() => 0.5 - Math.random()).slice(0, VEHICLES_PER_BATCH);
    await sendBatchUpdates(randomVehicles);
    displayStats();
    
    // Set interval for continuous updates
    const intervalId = setInterval(async () => {
      // Select random vehicles for this batch
      const randomVehicles = vehicles
        .sort(() => 0.5 - Math.random())
        .slice(0, VEHICLES_PER_BATCH);
      
      await sendBatchUpdates(randomVehicles);
      displayStats();
      
      // Check if we should continue
      if (stats.failedUpdates > 100) {
        log('⚠️  Too many failures. Checking connection...', colors.yellow);
        try {
          await getAuthToken(); // Refresh token
          log('✅ Connection restored', colors.green);
        } catch (error) {
          log('❌ Connection lost. Stopping simulation.', colors.red);
          clearInterval(intervalId);
        }
      }
    }, UPDATE_INTERVAL);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n\n👋 Stopping simulation...', colors.yellow);
      displayStats();
      log('✅ Simulation stopped successfully\n', colors.green);
      process.exit(0);
    });
    
  } catch (error) {
    log(`\n❌ Simulation failed to start: ${error.message}`, colors.red);
    log('💡 Make sure the API server is running: npm run dev', colors.yellow);
    process.exit(1);
  }
}

// Display help information
function showHelp() {
  console.log(`
${colors.bright}Sri Lanka Police - Tuk-Tuk Tracking Simulation${colors.reset}
${'='.repeat(60)}

${colors.cyan}Usage:${colors.reset}
  node scripts/simulate.js

${colors.cyan}Description:${colors.reset}
  Simulates real-time GPS location updates for all registered tuk-tuks.

${colors.cyan}Features:${colors.reset}
  • Automatically authenticates with the API
  • Fetches all registered vehicles from database
  • Generates realistic movement patterns
  • Sends location updates every 30 seconds
  • Updates 10 random vehicles per batch
  • Displays real-time statistics

${colors.cyan}Requirements:${colors.reset}
  • MongoDB must be running
  • API server must be running (npm run dev)
  • Database must be seeded (npm run seed)

${colors.cyan}Key Combinations:${colors.reset}
  • Ctrl+C - Stop the simulation

${'='.repeat(60)}
  `);
}

// Check if help flag is provided
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
} else {
  // Start the simulation
  runSimulation().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
class GeoLocation {
  static SRI_LANKA_BOUNDS = {
    north: 9.8,
    south: 5.9,
    east: 81.9,
    west: 79.5
  };
  
  static validateSriLankaCoordinates(lat, lng) {
    return lat >= this.SRI_LANKA_BOUNDS.south && 
           lat <= this.SRI_LANKA_BOUNDS.north &&
           lng >= this.SRI_LANKA_BOUNDS.west && 
           lng <= this.SRI_LANKA_BOUNDS.east;
  }
  
  static getDistrictCenter(districtName) {
    const centers = {
      'Colombo': { lat: 6.9271, lng: 79.8612 },
      'Gampaha': { lat: 7.0898, lng: 79.9920 },
      'Kalutara': { lat: 6.5854, lng: 79.9595 },
      'Kandy': { lat: 7.2906, lng: 80.6339 },
      'Galle': { lat: 6.0324, lng: 80.2173 }
    };
    
    return centers[districtName] || { lat: 7.0, lng: 80.0 };
  }
  
  static calculateBoundingBox(centerLat, centerLng, radiusKm) {
    const kmPerDegree = 111.32;
    const delta = radiusKm / kmPerDegree;
    
    return {
      north: centerLat + delta,
      south: centerLat - delta,
      east: centerLng + delta,
      west: centerLng - delta
    };
  }
}

module.exports = GeoLocation;
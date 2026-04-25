module.exports = {
  USER_ROLES: {
    HQ: 'HQ',
    PROVINCIAL: 'PROVINCIAL',
    STATION: 'STATION'
  },
  
  VEHICLE_STATUS: {
    ACTIVE: true,
    INACTIVE: false
  },
  
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  
  TIME_CONSTANTS: {
    ONE_HOUR: 3600000,
    ONE_DAY: 86400000,
    ONE_WEEK: 604800000,
    STALE_THRESHOLD: 3600000 // 1 hour
  },
  
  LOCATION: {
    SRI_LANKA_BOUNDS: {
      north: 9.8,
      south: 5.9,
      east: 81.9,
      west: 79.5
    }
  }
};
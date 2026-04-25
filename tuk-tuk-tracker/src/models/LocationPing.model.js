const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION_NAME = 'locationPings';

class LocationPingModel {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }
  
  static async create(pingData) {
    const collection = this.getCollection();
    const ping = {
      ...pingData,
      vehicleId: new ObjectId(pingData.vehicleId),
      timestamp: new Date()
    };
    
    const result = await collection.insertOne(ping);
    return { ...ping, _id: result.insertedId };
  }
  
  static async findByVehicleId(vehicleId, options = {}) {
    const collection = this.getCollection();
    const { limit = 100, startTime, endTime } = options;
    
    let filter = { vehicleId: new ObjectId(vehicleId) };
    
    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) filter.timestamp.$gte = new Date(startTime);
      if (endTime) filter.timestamp.$lte = new Date(endTime);
    }
    
    return await collection
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
  
  static async findWithFilters(filters = {}, options = {}) {
    const collection = this.getCollection();
    const {
      page = 1,
      limit = 1000,
      startTime,
      endTime,
      vehicleIds = []
    } = options;
    
    const filter = { ...filters };
    
    if (vehicleIds.length > 0) {
      filter.vehicleId = { $in: vehicleIds.map(id => new ObjectId(id)) };
    }
    
    if (startTime || endTime) {
      filter.timestamp = {};
      if (startTime) filter.timestamp.$gte = new Date(startTime);
      if (endTime) filter.timestamp.$lte = new Date(endTime);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [data, total] = await Promise.all([
      collection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)).toArray(),
      collection.countDocuments(filter)
    ]);
    
    return { data, total, page, limit };
  }
  
  static async getLatestPing(vehicleId) {
    const collection = this.getCollection();
    return await collection
      .find({ vehicleId: new ObjectId(vehicleId) })
      .sort({ timestamp: -1 })
      .limit(1)
      .next();
  }
  
  static async deleteOldPings(daysToKeep = 90) {
    const collection = this.getCollection();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await collection.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  }
}

module.exports = LocationPingModel;
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION_NAME = 'vehicles';

class VehicleModel {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }
  
  static async create(vehicleData) {
    const collection = this.getCollection();
    const vehicle = {
      ...vehicleData,
      districtId: new ObjectId(vehicleData.districtId),
      isActive: true,
      currentLocation: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(vehicle);
    return { ...vehicle, _id: result.insertedId };
  }
  
  static async findById(id) {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  
  static async findByDeviceId(deviceId) {
    const collection = this.getCollection();
    return await collection.findOne({ deviceId, isActive: true });
  }
  
  static async findAll(filters = {}, options = {}) {
    const collection = this.getCollection();
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    const [data, total] = await Promise.all([
      collection.find(filters).sort(sort).skip(skip).limit(parseInt(limit)).toArray(),
      collection.countDocuments(filters)
    ]);
    
    return { data, total, page, limit };
  }
  
  static async updateById(id, updateData) {
    const collection = this.getCollection();
    const update = {
      ...updateData,
      updatedAt: new Date()
    };
    
    if (updateData.districtId) {
      update.districtId = new ObjectId(updateData.districtId);
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );
    
    return result.modifiedCount > 0;
  }
  
  static async updateCurrentLocation(vehicleId, locationData) {
    const collection = this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(vehicleId) },
      { 
        $set: { 
          currentLocation: {
            ...locationData,
            timestamp: new Date()
          },
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }
  
  static async deleteById(id) {
    const collection = this.getCollection();
    // Soft delete
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    
    return result.modifiedCount > 0;
  }
  
  static async getVehiclesByDistrict(districtId) {
    const collection = this.getCollection();
    return await collection.find({ districtId: new ObjectId(districtId), isActive: true }).toArray();
  }
  
  static async getVehiclesByProvince(provinceId, districts) {
    const collection = this.getCollection();
    const districtIds = districts.map(d => new ObjectId(d._id));
    return await collection.find({ districtId: { $in: districtIds }, isActive: true }).toArray();
  }
}

module.exports = VehicleModel;
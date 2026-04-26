const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION_NAME = 'policeStations';

class PoliceStationModel {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }
  
  static async findAll(filters = {}) {
    const collection = this.getCollection();
    const query = {};
    
    if (filters.districtId) {
      query.districtId = new ObjectId(filters.districtId);
    }
    
    return await collection.find(query).sort({ name: 1 }).toArray();
  }
  
  static async findById(id) {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  
  static async findByDistrict(districtId) {
    const collection = this.getCollection();
    return await collection.find({ districtId: new ObjectId(districtId) }).toArray();
  }
  
  static async create(stationData) {
    const collection = this.getCollection();
    const station = {
      ...stationData,
      districtId: new ObjectId(stationData.districtId),
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(station);
    return { ...station, _id: result.insertedId };
  }

  static async update(id, stationData) {
    const collection = this.getCollection();
    const updateData = { ...stationData };
    if (updateData.districtId) {
      updateData.districtId = new ObjectId(updateData.districtId);
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
  
  static async delete(id) {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = PoliceStationModel;
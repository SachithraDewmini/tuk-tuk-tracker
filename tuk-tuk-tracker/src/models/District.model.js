const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');

const COLLECTION_NAME = 'districts';

class DistrictModel {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }
  
  static async findAll(filters = {}) {
    const collection = this.getCollection();
    const query = {};
    
    if (filters.provinceId) {
      query.provinceId = new ObjectId(filters.provinceId);
    }
    
    return await collection.find(query).sort({ name: 1 }).toArray();
  }
  
  static async findById(id) {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  
  static async findByProvince(provinceId) {
    const collection = this.getCollection();
    return await collection.find({ provinceId: new ObjectId(provinceId) }).toArray();
  }
  
  static async create(districtData) {
    const collection = this.getCollection();
    const district = {
      ...districtData,
      provinceId: new ObjectId(districtData.provinceId)
    };
    
    const result = await collection.insertOne(district);
    return { ...district, _id: result.insertedId };
  }
}

module.exports = DistrictModel;
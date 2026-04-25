const { getDB } = require('../config/database');

const COLLECTION_NAME = 'provinces';

class ProvinceModel {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }
  
  static async findAll() {
    const collection = this.getCollection();
    return await collection.find({}).sort({ name: 1 }).toArray();
  }
  
  static async findById(id) {
    const collection = this.getCollection();
    const { ObjectId } = require('mongodb');
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  
  static async create(provinceData) {
    const collection = this.getCollection();
    const result = await collection.insertOne(provinceData);
    return { ...provinceData, _id: result.insertedId };
  }
}

module.exports = ProvinceModel;
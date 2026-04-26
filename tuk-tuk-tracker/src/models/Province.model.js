const { ObjectId } = require('mongodb');
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
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  
  static async create(provinceData) {
    const collection = this.getCollection();
    const result = await collection.insertOne(provinceData);
    return { ...provinceData, _id: result.insertedId };
  }
  static async update(id, provinceData) {
    const collection = this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...provinceData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
  
  static async delete(id) {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}

module.exports = ProvinceModel;
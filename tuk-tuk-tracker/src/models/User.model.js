const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { getDB } = require('../config/database');

const COLLECTION_NAME = 'users';

class UserModel {
  static getCollection() {
    return getDB().collection(COLLECTION_NAME);
  }
  
  static async create(userData) {
    const collection = this.getCollection();
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user = {
      username: userData.username,
      passwordHash,
      name: userData.name,
      role: userData.role,
      provinceId: userData.provinceId ? new ObjectId(userData.provinceId) : null,
      districtId: userData.districtId ? new ObjectId(userData.districtId) : null,
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null
    };
    
    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }
  
  static async findByUsername(username) {
    const collection = this.getCollection();
    return await collection.findOne({ username });
  }
  
  static async findById(id) {
    const collection = this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }
  
  static async validatePassword(user, password) {
    return await bcrypt.compare(password, user.passwordHash);
  }
  
  static async updateLastLogin(id) {
    const collection = this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLoginAt: new Date() } }
    );
  }
  
  static async changePassword(id, newPassword) {
    const collection = this.getCollection();
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { passwordHash, updatedAt: new Date() } }
    );
    
    return result.modifiedCount > 0;
  }

  static async findAll(filters = {}) {
    const collection = this.getCollection();
    const query = {};
    
    if (filters.role) query.role = filters.role;
    if (filters.provinceId) query.provinceId = new ObjectId(filters.provinceId);
    if (filters.districtId) query.districtId = new ObjectId(filters.districtId);
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    
    return await collection.find(query).sort({ username: 1 }).toArray();
  }
  
  static async update(id, userData) {
    const collection = this.getCollection();
    const updateData = { ...userData };
    
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    
    if (updateData.provinceId) updateData.provinceId = new ObjectId(updateData.provinceId);
    if (updateData.districtId) updateData.districtId = new ObjectId(updateData.districtId);
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
  
  static async delete(id) {
    const collection = this.getCollection();
    // Soft delete by deactivating
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }
}

module.exports = UserModel;
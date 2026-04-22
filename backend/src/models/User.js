import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../config/lowdb.js';

class User {
  static async findByEmail(email) {
    const db = await getDB();
    return db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static async findById(id) {
    const db = await getDB();
    return db.data.users.find(u => u._id === id);
  }

  static async create(data) {
    const db = await getDB();
    const user = {
      _id: uuidv4(),
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
      photoURL: data.photoURL || null,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    };
    db.data.users.push(user);
    await db.write();
    return user;
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = await getDB();
    const user = db.data.users.find(u => u._id === id);
    if (!user) return null;
    
    Object.assign(user, updateData, { updatedAt: new Date() });
    await db.write();
    return user;
  }

  static async findByIdAndDelete(id) {
    const db = await getDB();
    const index = db.data.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    
    const deleted = db.data.users.splice(index, 1);
    await db.write();
    return deleted[0];
  }

  static async updateLastActivity(userId) {
    return this.findByIdAndUpdate(userId, { lastActivityAt: new Date() });
  }
}

export default User;

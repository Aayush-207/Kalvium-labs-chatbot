import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../config/lowdb.js';

class Message {
  static async create(data) {
    const db = await getDB();
    const message = {
      _id: uuidv4(),
      userId: data.userId,
      sender: data.sender, // 'user' or 'bot'
      text: data.text,
      messageHash: data.messageHash || null,
      timestamp: new Date(),
      status: data.status || 'sent',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.data.messages.push(message);
    await db.write();
    return message;
  }

  static async findById(id) {
    const db = await getDB();
    return db.data.messages.find(m => m._id === id);
  }

  static async find(query) {
    const db = await getDB();
    let results = db.data.messages;

    if (query.userId) {
      results = results.filter(m => m.userId === query.userId);
    }
    if (query.messageHash) {
      results = results.filter(m => m.messageHash === query.messageHash);
    }

    // Sort by timestamp descending if specified
    if (query.sort && query.sort.timestamp === -1) {
      results = results.sort((a, b) => b.timestamp - a.timestamp);
    }

    return results;
  }

  static async findByIdAndUpdate(id, updateData) {
    const db = await getDB();
    const message = db.data.messages.find(m => m._id === id);
    if (!message) return null;

    Object.assign(message, updateData, { updatedAt: new Date() });
    await db.write();
    return message;
  }

  static async deleteMany(query) {
    const db = await getDB();
    const initialLength = db.data.messages.length;

    db.data.messages = db.data.messages.filter(m => {
      if (query.userId && m.userId === query.userId) return false;
      return true;
    });

    await db.write();
    return { deletedCount: initialLength - db.data.messages.length };
  }
}

export default Message;

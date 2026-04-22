import { connectDB as connectLowDB } from './lowdb.js';

// Use lowdb (file-based) instead of MongoDB for development
export default connectLowDB;

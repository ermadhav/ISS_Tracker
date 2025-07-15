// server/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address']
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },
  lastAlertSent: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
export default User;

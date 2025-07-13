const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    default: 'Google'
  },
  mobile: {
    type: String,
    default: null
  },
  address: {
    addressLine: {
      type: String,
      default: null
    },
    landmark: {
      type: String,
      default: null
    },
    pincode: {
      type: String,
      default: null
    }
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("User", UserSchema);
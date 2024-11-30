const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Middleware for hashing password before saving
const hashPassword = async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.consumerId) {
    this.consumerId = uuidv4(); // Generate a unique consumer ID using uuid
  }
  this.updatedAt = new Date();
  next();
};

// Middleware for updating the updatedAt field
const updateUpdatedAt = function (next) {
  this.set({ updatedAt: new Date() });
  next();
};

module.exports = { hashPassword, updateUpdatedAt };

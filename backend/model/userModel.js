const mongoose = require("mongoose");
const { hashPassword, updateUpdatedAt } = require("../middleweres/Hashing.js");




// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: "text@123" },
  role: { type: String, default: "USER" },
  consumerId: { type: String, unique: true },
  consumerName: { type: String, required: true },
  profilePicture: String,
  notification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GpAnnouncement",
      index: true,
    },
  ],
  complaint: [
    { type: mongoose.Schema.Types.ObjectId, ref: "userComplaint", index: true },
  ],
  address: { type: String, required: true },
  firebaseToken: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Apply middleware
UserSchema.pre("save", hashPassword);
UserSchema.pre('findOneAndUpdate', updateUpdatedAt);
UserSchema.pre('save', async function (next) {
  // Generate a unique consumerId
  if (!this.consumerId) {
    this.consumerId = uuidv4();  // Generate a unique consumer ID using uuid
  }
  next();
});

// Method to check if the provided password matches the hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserComplaintSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const UserComplaint = mongoose.model("UserComplaint", UserComplaintSchema);

module.exports = { User, UserComplaint };

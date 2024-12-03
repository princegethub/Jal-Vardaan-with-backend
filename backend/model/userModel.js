const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema({
  consumerId: { type: String, unique: true }, // Unique identifier for the user
  consumerName: { type: String, required: true },
  contact: { type: String, required: true, unique: true }, // Unique contact number
  password: { type: String, required: true }, 
  role: { type: String, default: "USER" },
  address: { type: String, required: true },
  profilePicture: {
    type: String,
    default: 'https://static.vecteezy.com/system/resources/previews/022/450/297/original/3d-minimal-purple-user-profile-avatar-icon-in-circle-white-frame-design-vector.jpg',
  },
  notification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GpAnnouncement",
      index: true,
    },
  ],
  complaint: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userComplaint",
      index: true,
    },
  ],
  firebaseToken: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const UserComplaintSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
const UserComplaint = mongoose.model("UserComplaint", UserComplaintSchema);

module.exports = { User, UserComplaint };

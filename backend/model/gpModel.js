const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



// GP Schema
const GpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: {
    type: String,
    unique: true,  // This enforces unique values for the 'email' field
    required: false, // Set to false if email is not mandatory
},
  password: { type: String, required: true },
  lgdCode: { type: String, required: true },
  role: { type: String, default: "GP" },
  profilePicture: {type: String, default: 'https://static.vecteezy.com/system/resources/previews/022/450/297/original/3d-minimal-purple-user-profile-avatar-icon-in-circle-white-frame-design-vector.jpg'},
  alert: [
    { type: mongoose.Schema.Types.ObjectId, ref: "UserComplaint", index: true },
  ],
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GpAnnouncement",
      index: true,
    },
  ],
  userList: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  ],
  inactiveUserList:[],
  assets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Asset", index: true }],
  inventory: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", index: true },
  ],
  requestFund: [
    { type: mongoose.Schema.Types.ObjectId, ref: "FundRequest", index: true },
  ],
  complaint: [
    { type: mongoose.Schema.Types.ObjectId, ref: "GpComplaint", index: true },
  ],
  notification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PhedAnnouncement",
      index: true,
    },
  ],
  grampanchayatId: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  villageName: { type: String, required: true },
  aadhar: { type: Number, unique: true },
  income: [{ type: mongoose.Schema.Types.ObjectId, ref: "Income" }],
  expenditure: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expenditure" }],
  firebaseToken: String,
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true }); ;

// Asset Schema
const AssetSchema = new mongoose.Schema({
  gpLgdCode: { type: String, required: true },
  assetName: { type: String, required: true },
  AssetQuantity: {type: Number , require: true},
  assetCategory: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Inventory Schema
const InventorySchema = new mongoose.Schema({
  gpLgdCode: { type: String, required: true },
  inventoryName: { type: String, required: true },
  inventoryCategory: { type: String, required: true },
  inventoryQuantity: {type: Number , require: true},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Income Schema
const IncomeSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  document: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Expenditure Schema
const ExpenditureSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  document: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// GP Announcement Schema
const GpAnnouncementSchema = new mongoose.Schema({
  category: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// GP Complaint Schema
const GpComplaintSchema = new mongoose.Schema({
  category: { type: String, required: true },
  message: { type: String, required: true },
  status: { type:Boolean, default: false},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Fund Request Schema
const FundRequestSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true }, // Fixed typo from 'ammount' to 'amount'
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});




// Model creation
const Grampanchayat = mongoose.model("Gp", GpSchema);
const GpAnnouncement = mongoose.model("GpAnnouncement", GpAnnouncementSchema);
const GpComplaint = mongoose.model("GpComplaint", GpComplaintSchema);
const FundRequest = mongoose.model("FundRequest", FundRequestSchema);
const Asset = mongoose.model("Asset", AssetSchema);
const Inventory = mongoose.model("Inventory", InventorySchema);
const Income = mongoose.model("Income", IncomeSchema);
const Expenditure = mongoose.model("Expenditure", ExpenditureSchema);

module.exports = {
  Grampanchayat,
  GpAnnouncement,
  GpComplaint,
  FundRequest,
  Asset,
  Inventory,
  Income,
  Expenditure,
};

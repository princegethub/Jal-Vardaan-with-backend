const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const hashPassword = require("./commanUtility")
const updateUpdatedAt = require("./commanUtility")
const { hashPassword, updateUpdatedAt } = require("../middleweres/Hashing.js");


// GP Schema
const GpSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lgdCode: { type: String, required: true },
  role: { type: String, default: "GP" },
  profilePicture: { type: String },
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
  aadhar: { type: String, unique: true },
  income: [{ type: mongoose.Schema.Types.ObjectId, ref: "Income" }],
  expenditure: [{ type: mongoose.Schema.Types.ObjectId, ref: "Expenditure" }],
  firebaseToken: String,
  status: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Asset Schema
const AssetSchema = new mongoose.Schema({
  assetName: { type: String, required: true },
  assetCategory: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Inventory Schema
const InventorySchema = new mongoose.Schema({
  inventoryName: { type: String, required: true },
  inventoryCategory: { type: String, required: true },
  inventoryQuantity: { type: String }, // Fixed type definition
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

// Password hashing middleware for GP Schema
// Apply middleware
GpSchema.pre("save", hashPassword);
GpSchema.pre("findOneAndUpdate", updateUpdatedAt);
GpSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Token generation method for GP Schema
GpSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, grampanchayatId: this.grampanchayatId },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
};

// Model creation
const Gp = mongoose.model("Gp", GpSchema);
const GpAnnouncement = mongoose.model("GpAnnouncement", GpAnnouncementSchema);
const GpComplaint = mongoose.model("GpComplaint", GpComplaintSchema);
const FundRequest = mongoose.model("FundRequest", FundRequestSchema);
const Asset = mongoose.model("Asset", AssetSchema);
const Inventory = mongoose.model("Inventory", InventorySchema);
const Income = mongoose.model("Income", IncomeSchema);
const Expenditure = mongoose.model("Expenditure", ExpenditureSchema);

module.exports = {
  Gp,
  GpAnnouncement,
  GpComplaint,
  FundRequest,
  Asset,
  Inventory,
  Income,
  Expenditure,
};

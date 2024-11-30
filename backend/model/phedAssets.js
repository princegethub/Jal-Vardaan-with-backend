const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Asset name
  quantity: { type: Number, default: 0 }, // Current quantity of the asset
  editHistory: [
    {
      date: { type: Date, default: Date.now }, // Date of edit
      quantityAdded: Number, // Quantity added or modified
      updatedQuantity: Number, // Quantity after the edit
      description: { type: String, default: '' }, // Description of the change
    },
  ],
});

// Change the model name here to 'AssetPhed'
module.exports = mongoose.model('AssetPhed', assetSchema);

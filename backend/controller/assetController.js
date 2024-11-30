const AssetPhed = require('../model/phedAssets'); // Import the AssetPhed model

// Add a new asset
const addAssetPhed = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Asset name is required.' });
    }

    const existingAsset = await AssetPhed.findOne({ name });
    if (existingAsset) {
      return res.status(400).json({ message: 'Asset already exists.' });
    }

    const newAsset = new AssetPhed({ name });
    await newAsset.save();

    return res.status(201).json({ message: 'Asset added successfully.', asset: newAsset });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

// Add quantity to an existing asset
const addQuantityToAssetPhed = async (req, res) => {
  try {
    const { name, quantityToAdd, description } = req.body;

    if (!name || quantityToAdd === undefined) {
      return res.status(400).json({ message: 'Asset name and quantity to add are required.' });
    }

    if (!description) {
      return res
        .status(400)
        .json({ message: 'Description is required when adding or editing quantity.' });
    }

    // Use case-insensitive query
    const asset = await AssetPhed.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    console.log('Asset found:', asset);

    // Update quantity and add to history
    asset.quantity += quantityToAdd;
    asset.editHistory.push({
      quantityAdded: quantityToAdd,
      updatedQuantity: asset.quantity,
      description, // Add description to edit history
    });

    await asset.save();

    // Return updated asset with edit history
    return res.status(200).json({
      message: 'Quantity added successfully.',
      asset,
    });
  } catch (error) {
    console.error('Error in addQuantityToAssetPhed:', error);
    return res.status(500).json({
      message: 'Server error.',
      error: error.message,
    });
  }
};


// Edit quantity of an asset
const editAssetPhedQuantity = async (req, res) => {
  try {
    const { name, quantityToAdd } = req.body;

    if (!name || quantityToAdd === undefined) {
      return res.status(400).json({ message: 'Asset name and quantity to add are required.' });
    }

    const asset = await AssetPhed.findOne({ name });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    // Update quantity
    asset.quantity += quantityToAdd;
    asset.editHistory.push({
      quantityAdded: quantityToAdd,
      updatedQuantity: asset.quantity,
    });

    await asset.save();

    return res.status(200).json({ message: 'Asset quantity updated successfully.', asset });
  } catch (error) {
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};
const listAssetsPhed = async (req, res) => {
  try {
    // Fetch all assets
    const assets = await AssetPhed.find();

    // Respond with all assets, including edit history
    return res.status(200).json({ assets });
  } catch (error) {
    console.error('Error in listAssetsPhed:', error);
    return res.status(500).json({
      message: 'Server error.',
      error: error.message,
    });
  }
};


module.exports = {
  addAssetPhed,
  addQuantityToAssetPhed,
  listAssetsPhed,
  editAssetPhedQuantity,
};
